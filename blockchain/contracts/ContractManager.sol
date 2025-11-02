// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContractManager
 * @dev Smart contract để quản lý hợp đồng công trên Ethereum blockchain
 * @notice Contract này lưu trữ thông tin hợp đồng và lịch sử thay đổi
 */
contract ContractManager {
    
    // Cấu trúc dữ liệu cho Contract
    struct Contract {
        string contractNumber;      // Số hợp đồng
        string contractName;        // Tên hợp đồng
        string contractor;          // Nhà thầu
        uint256 contractValue;      // Giá trị hợp đồng (wei)
        string currency;            // Đơn vị tiền tệ
        uint256 startDate;          // Ngày bắt đầu (timestamp)
        uint256 endDate;            // Ngày kết thúc (timestamp)
        string contractType;        // Loại hợp đồng
        string status;              // Trạng thái
        string department;          // Phòng ban
        string responsiblePerson;   // Người phụ trách
        address createdBy;          // Người tạo
        uint256 createdAt;          // Thời gian tạo
        bool isActive;              // Trạng thái hoạt động
    }
    
    // Cấu trúc cho lịch sử thay đổi
    struct ContractHistory {
        string contractNumber;
        string action;              // created, updated, approved, cancelled
        string previousStatus;
        string newStatus;
        address performedBy;
        uint256 timestamp;
        string remarks;
    }
    
    // Mapping lưu trữ contracts
    mapping(string => Contract) private contracts;
    mapping(string => bool) private contractExists;
    mapping(string => ContractHistory[]) private contractHistory;
    
    // Danh sách các contract numbers
    string[] private contractNumbers;
    
    // Owner của contract
    address public owner;
    
    // Các địa chỉ được phép tạo/cập nhật contracts
    mapping(address => bool) public authorizedUsers;
    
    // Events
    event ContractCreated(
        string indexed contractNumber,
        string contractName,
        address indexed createdBy,
        uint256 timestamp
    );
    
    event ContractUpdated(
        string indexed contractNumber,
        string action,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    event ContractStatusChanged(
        string indexed contractNumber,
        string previousStatus,
        string newStatus,
        address indexed changedBy,
        uint256 timestamp
    );
    
    event UserAuthorized(address indexed user, bool authorized);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedUsers[msg.sender] || msg.sender == owner,
            "Not authorized to perform this action"
        );
        _;
    }
    
    modifier contractMustExist(string memory _contractNumber) {
        require(contractExists[_contractNumber], "Contract does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedUsers[msg.sender] = true;
    }
    
    /**
     * @dev Ủy quyền hoặc thu hồi quyền cho user
     */
    function authorizeUser(address _user, bool _authorized) external onlyOwner {
        authorizedUsers[_user] = _authorized;
        emit UserAuthorized(_user, _authorized);
    }
    
    /**
     * @dev Tạo contract mới
     */
    function createContract(
        string memory _contractNumber,
        string memory _contractName,
        string memory _contractor,
        uint256 _contractValue,
        string memory _currency,
        uint256 _startDate,
        uint256 _endDate,
        string memory _contractType,
        string memory _department,
        string memory _responsiblePerson
    ) external onlyAuthorized {
        require(!contractExists[_contractNumber], "Contract already exists");
        require(_endDate > _startDate, "End date must be after start date");
        require(bytes(_contractNumber).length > 0, "Contract number is required");
        
        Contract memory newContract = Contract({
            contractNumber: _contractNumber,
            contractName: _contractName,
            contractor: _contractor,
            contractValue: _contractValue,
            currency: _currency,
            startDate: _startDate,
            endDate: _endDate,
            contractType: _contractType,
            status: "draft",
            department: _department,
            responsiblePerson: _responsiblePerson,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            isActive: true
        });
        
        contracts[_contractNumber] = newContract;
        contractExists[_contractNumber] = true;
        contractNumbers.push(_contractNumber);
        
        // Thêm vào lịch sử
        _addHistory(
            _contractNumber,
            "created",
            "",
            "draft",
            "Contract created on blockchain"
        );
        
        emit ContractCreated(_contractNumber, _contractName, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Cập nhật trạng thái contract
     */
    function updateContractStatus(
        string memory _contractNumber,
        string memory _newStatus,
        string memory _remarks
    ) external onlyAuthorized contractMustExist(_contractNumber) {
        Contract storage contractData = contracts[_contractNumber];
        require(contractData.isActive, "Contract is not active");
        
        string memory previousStatus = contractData.status;
        contractData.status = _newStatus;
        
        _addHistory(
            _contractNumber,
            "status_changed",
            previousStatus,
            _newStatus,
            _remarks
        );
        
        emit ContractStatusChanged(
            _contractNumber,
            previousStatus,
            _newStatus,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Cập nhật thông tin contract
     */
    function updateContract(
        string memory _contractNumber,
        string memory _contractName,
        string memory _contractor,
        uint256 _contractValue,
        string memory _currency,
        uint256 _startDate,
        uint256 _endDate,
        string memory _contractType,
        string memory _department,
        string memory _responsiblePerson
    ) external onlyAuthorized contractMustExist(_contractNumber) {
        Contract storage contractData = contracts[_contractNumber];
        require(contractData.isActive, "Contract is not active");
        require(_endDate > _startDate, "End date must be after start date");
        
        contractData.contractName = _contractName;
        contractData.contractor = _contractor;
        contractData.contractValue = _contractValue;
        contractData.currency = _currency;
        contractData.startDate = _startDate;
        contractData.endDate = _endDate;
        contractData.contractType = _contractType;
        contractData.department = _department;
        contractData.responsiblePerson = _responsiblePerson;
        
        _addHistory(
            _contractNumber,
            "updated",
            contractData.status,
            contractData.status,
            "Contract information updated"
        );
        
        emit ContractUpdated(_contractNumber, "updated", msg.sender, block.timestamp);
    }
    
    /**
     * @dev Vô hiệu hóa contract (soft delete)
     */
    function deactivateContract(
        string memory _contractNumber,
        string memory _reason
    ) external onlyAuthorized contractMustExist(_contractNumber) {
        Contract storage contractData = contracts[_contractNumber];
        require(contractData.isActive, "Contract is already inactive");
        
        contractData.isActive = false;
        
        _addHistory(
            _contractNumber,
            "deactivated",
            contractData.status,
            "cancelled",
            _reason
        );
        
        emit ContractUpdated(_contractNumber, "deactivated", msg.sender, block.timestamp);
    }
    
    /**
     * @dev Lấy thông tin cơ bản contract
     */
    function getContract(string memory _contractNumber)
        external
        view
        contractMustExist(_contractNumber)
        returns (Contract memory)
    {
        return contracts[_contractNumber];
    }
    
    /**
     * @dev Lấy thông tin contract chi tiết (chia nhỏ để tránh stack too deep)
     */
    function getContractBasicInfo(string memory _contractNumber)
        external
        view
        contractMustExist(_contractNumber)
        returns (
            string memory contractNumber,
            string memory contractName,
            string memory contractor,
            uint256 contractValue,
            string memory currency
        )
    {
        Contract memory c = contracts[_contractNumber];
        return (
            c.contractNumber,
            c.contractName,
            c.contractor,
            c.contractValue,
            c.currency
        );
    }
    
    /**
     * @dev Lấy thông tin thời gian contract
     */
    function getContractTimeInfo(string memory _contractNumber)
        external
        view
        contractMustExist(_contractNumber)
        returns (
            uint256 startDate,
            uint256 endDate,
            uint256 createdAt
        )
    {
        Contract memory c = contracts[_contractNumber];
        return (
            c.startDate,
            c.endDate,
            c.createdAt
        );
    }
    
    /**
     * @dev Lấy thông tin trạng thái contract
     */
    function getContractStatusInfo(string memory _contractNumber)
        external
        view
        contractMustExist(_contractNumber)
        returns (
            string memory contractType,
            string memory status,
            string memory department,
            string memory responsiblePerson,
            address createdBy,
            bool isActive
        )
    {
        Contract memory c = contracts[_contractNumber];
        return (
            c.contractType,
            c.status,
            c.department,
            c.responsiblePerson,
            c.createdBy,
            c.isActive
        );
    }
    
    /**
     * @dev Lấy lịch sử thay đổi của contract
     */
    function getContractHistory(string memory _contractNumber)
        external
        view
        contractMustExist(_contractNumber)
        returns (ContractHistory[] memory)
    {
        return contractHistory[_contractNumber];
    }
    
    /**
     * @dev Lấy tổng số contracts
     */
    function getContractCount() external view returns (uint256) {
        return contractNumbers.length;
    }
    
    /**
     * @dev Lấy contract number theo index
     */
    function getContractNumberByIndex(uint256 _index) external view returns (string memory) {
        require(_index < contractNumbers.length, "Index out of bounds");
        return contractNumbers[_index];
    }
    
    /**
     * @dev Kiểm tra contract có tồn tại không
     */
    function doesContractExist(string memory _contractNumber) external view returns (bool) {
        return contractExists[_contractNumber];
    }
    
    /**
     * @dev Internal function để thêm lịch sử
     */
    function _addHistory(
        string memory _contractNumber,
        string memory _action,
        string memory _previousStatus,
        string memory _newStatus,
        string memory _remarks
    ) private {
        ContractHistory memory historyEntry = ContractHistory({
            contractNumber: _contractNumber,
            action: _action,
            previousStatus: _previousStatus,
            newStatus: _newStatus,
            performedBy: msg.sender,
            timestamp: block.timestamp,
            remarks: _remarks
        });
        
        contractHistory[_contractNumber].push(historyEntry);
    }
    
    /**
     * @dev Lấy thông tin cơ bản của nhiều contracts (pagination)
     */
    function getContractsBatch(uint256 _startIndex, uint256 _count)
        external
        view
        returns (
            string[] memory numbers,
            string[] memory names,
            string[] memory statuses,
            uint256[] memory values
        )
    {
        require(_startIndex < contractNumbers.length, "Start index out of bounds");
        
        uint256 endIndex = _startIndex + _count;
        if (endIndex > contractNumbers.length) {
            endIndex = contractNumbers.length;
        }
        
        uint256 actualCount = endIndex - _startIndex;
        
        numbers = new string[](actualCount);
        names = new string[](actualCount);
        statuses = new string[](actualCount);
        values = new uint256[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            string memory contractNumber = contractNumbers[_startIndex + i];
            Contract memory c = contracts[contractNumber];
            
            numbers[i] = c.contractNumber;
            names[i] = c.contractName;
            statuses[i] = c.status;
            values[i] = c.contractValue;
        }
        
        return (numbers, names, statuses, values);
    }
}
