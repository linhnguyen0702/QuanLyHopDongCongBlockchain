package main

import (
    "encoding/json"
    "fmt"
    "time"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ContractChaincode provides functions for managing contracts
type ContractChaincode struct {
	contractapi.Contract
}

// Contract represents a contract in the blockchain
type Contract struct {
	ID               string    `json:"id"`
	ContractNumber   string    `json:"contractNumber"`
	ContractName     string    `json:"contractName"`
	Contractor       string    `json:"contractor"`
	ContractValue    float64   `json:"contractValue"`
	Currency         string    `json:"currency"`
	StartDate        string    `json:"startDate"`
	EndDate          string    `json:"endDate"`
	ContractType     string    `json:"contractType"`
	Status           string    `json:"status"`
	Department       string    `json:"department"`
	ResponsiblePerson string   `json:"responsiblePerson"`
	CreatedBy        string    `json:"createdBy"`
	ApprovedBy       string    `json:"approvedBy,omitempty"`
	CreatedAt        string    `json:"createdAt"`
	ApprovedAt       string    `json:"approvedAt,omitempty"`
	UpdatedAt        string    `json:"updatedAt,omitempty"`
	Version          int       `json:"version"`
	History          []History `json:"history"`
}

// History represents a change in contract status
type History struct {
	Action      string    `json:"action"`
	PerformedBy string    `json:"performedBy"`
	PerformedAt string    `json:"performedAt"`
	Comment     string    `json:"comment,omitempty"`
	Changes     map[string]interface{} `json:"changes,omitempty"`
}

// CreateContract creates a new contract
func (s *ContractChaincode) CreateContract(ctx contractapi.TransactionContextInterface, contractJSON string) error {
	var contract Contract
	err := json.Unmarshal([]byte(contractJSON), &contract)
	if err != nil {
		return fmt.Errorf("failed to unmarshal contract: %v", err)
	}

	// Check if contract already exists
	existingContract, err := ctx.GetStub().GetState(contract.ID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existingContract != nil {
		return fmt.Errorf("contract %s already exists", contract.ID)
	}

	// Set initial history
	contract.History = []History{
		{
			Action:      "created",
			PerformedBy: contract.CreatedBy,
			PerformedAt: contract.CreatedAt,
			Comment:     "Contract created",
		},
	}

	// Store contract
	contractBytes, err := json.Marshal(contract)
	if err != nil {
		return fmt.Errorf("failed to marshal contract: %v", err)
	}

	err = ctx.GetStub().PutState(contract.ID, contractBytes)
	if err != nil {
		return fmt.Errorf("failed to put contract to world state: %v", err)
	}

	// Create composite key for querying
	contractKey, err := ctx.GetStub().CreateCompositeKey("contract", []string{contract.Status, contract.ID})
	if err != nil {
		return fmt.Errorf("failed to create composite key: %v", err)
	}

	err = ctx.GetStub().PutState(contractKey, contractBytes)
	if err != nil {
		return fmt.Errorf("failed to put contract composite key: %v", err)
	}

	return nil
}

// UpdateContract updates an existing contract
func (s *ContractChaincode) UpdateContract(ctx contractapi.TransactionContextInterface, contractJSON string) error {
	var updatedContract Contract
	err := json.Unmarshal([]byte(contractJSON), &updatedContract)
	if err != nil {
		return fmt.Errorf("failed to unmarshal contract: %v", err)
	}

	// Get existing contract
	existingContractBytes, err := ctx.GetStub().GetState(updatedContract.ID)
	if err != nil {
		return fmt.Errorf("failed to read contract from world state: %v", err)
	}
	if existingContractBytes == nil {
		return fmt.Errorf("contract %s does not exist", updatedContract.ID)
	}

	var existingContract Contract
	err = json.Unmarshal(existingContractBytes, &existingContract)
	if err != nil {
		return fmt.Errorf("failed to unmarshal existing contract: %v", err)
	}

	// Preserve history and increment version
	updatedContract.History = existingContract.History
	updatedContract.Version = existingContract.Version + 1
	updatedContract.UpdatedAt = time.Now().Format(time.RFC3339)

	// Add update to history
	updatedContract.History = append(updatedContract.History, History{
		Action:      "updated",
		PerformedBy: updatedContract.CreatedBy,
		PerformedAt: updatedContract.UpdatedAt,
		Comment:     "Contract updated",
	})

	// Store updated contract
	contractBytes, err := json.Marshal(updatedContract)
	if err != nil {
		return fmt.Errorf("failed to marshal updated contract: %v", err)
	}

	err = ctx.GetStub().PutState(updatedContract.ID, contractBytes)
	if err != nil {
		return fmt.Errorf("failed to put updated contract to world state: %v", err)
	}

	// Update composite key if status changed
	if existingContract.Status != updatedContract.Status {
		// Remove old composite key
		oldContractKey, err := ctx.GetStub().CreateCompositeKey("contract", []string{existingContract.Status, existingContract.ID})
		if err != nil {
			return fmt.Errorf("failed to create old composite key: %v", err)
		}
		err = ctx.GetStub().DelState(oldContractKey)
		if err != nil {
			return fmt.Errorf("failed to delete old composite key: %v", err)
		}

		// Create new composite key
		newContractKey, err := ctx.GetStub().CreateCompositeKey("contract", []string{updatedContract.Status, updatedContract.ID})
		if err != nil {
			return fmt.Errorf("failed to create new composite key: %v", err)
		}
		err = ctx.GetStub().PutState(newContractKey, contractBytes)
		if err != nil {
			return fmt.Errorf("failed to put new composite key: %v", err)
		}
	}

	return nil
}

// ApproveContract approves a contract
func (s *ContractChaincode) ApproveContract(ctx contractapi.TransactionContextInterface, contractID string, approvedBy string, approvedAt string) error {
	// Get existing contract
	contractBytes, err := ctx.GetStub().GetState(contractID)
	if err != nil {
		return fmt.Errorf("failed to read contract from world state: %v", err)
	}
	if contractBytes == nil {
		return fmt.Errorf("contract %s does not exist", contractID)
	}

	var contract Contract
	err = json.Unmarshal(contractBytes, &contract)
	if err != nil {
		return fmt.Errorf("failed to unmarshal contract: %v", err)
	}

	// Update contract status
	contract.Status = "approved"
	contract.ApprovedBy = approvedBy
	contract.ApprovedAt = approvedAt
	contract.UpdatedAt = time.Now().Format(time.RFC3339)

	// Add approval to history
	contract.History = append(contract.History, History{
		Action:      "approved",
		PerformedBy: approvedBy,
		PerformedAt: approvedAt,
		Comment:     "Contract approved",
	})

	// Store updated contract
	updatedContractBytes, err := json.Marshal(contract)
	if err != nil {
		return fmt.Errorf("failed to marshal approved contract: %v", err)
	}

	err = ctx.GetStub().PutState(contractID, updatedContractBytes)
	if err != nil {
		return fmt.Errorf("failed to put approved contract to world state: %v", err)
	}

	// Update composite key
	contractKey, err := ctx.GetStub().CreateCompositeKey("contract", []string{contract.Status, contract.ID})
	if err != nil {
		return fmt.Errorf("failed to create composite key: %v", err)
	}

	err = ctx.GetStub().PutState(contractKey, updatedContractBytes)
	if err != nil {
		return fmt.Errorf("failed to put contract composite key: %v", err)
	}

	return nil
}

// ActivateContract activates a contract
func (s *ContractChaincode) ActivateContract(ctx contractapi.TransactionContextInterface, contractID string, activatedAt string) error {
	// Get existing contract
	contractBytes, err := ctx.GetStub().GetState(contractID)
	if err != nil {
		return fmt.Errorf("failed to read contract from world state: %v", err)
	}
	if contractBytes == nil {
		return fmt.Errorf("contract %s does not exist", contractID)
	}

	var contract Contract
	err = json.Unmarshal(contractBytes, &contract)
	if err != nil {
		return fmt.Errorf("failed to unmarshal contract: %v", err)
	}

	// Update contract status
	contract.Status = "active"
	contract.UpdatedAt = time.Now().Format(time.RFC3339)

	// Add activation to history
	contract.History = append(contract.History, History{
		Action:      "activated",
		PerformedBy: contract.ApprovedBy,
		PerformedAt: activatedAt,
		Comment:     "Contract activated",
	})

	// Store updated contract
	updatedContractBytes, err := json.Marshal(contract)
	if err != nil {
		return fmt.Errorf("failed to marshal activated contract: %v", err)
	}

	err = ctx.GetStub().PutState(contractID, updatedContractBytes)
	if err != nil {
		return fmt.Errorf("failed to put activated contract to world state: %v", err)
	}

	// Update composite key
	contractKey, err := ctx.GetStub().CreateCompositeKey("contract", []string{contract.Status, contract.ID})
	if err != nil {
		return fmt.Errorf("failed to create composite key: %v", err)
	}

	err = ctx.GetStub().PutState(contractKey, updatedContractBytes)
	if err != nil {
		return fmt.Errorf("failed to put contract composite key: %v", err)
	}

	return nil
}

// RejectContract rejects a contract
func (s *ContractChaincode) RejectContract(ctx contractapi.TransactionContextInterface, contractID string, rejectedBy string, rejectedAt string) error {
	// Get existing contract
	contractBytes, err := ctx.GetStub().GetState(contractID)
	if err != nil {
		return fmt.Errorf("failed to read contract from world state: %v", err)
	}
	if contractBytes == nil {
		return fmt.Errorf("contract %s does not exist", contractID)
	}

	var contract Contract
	err = json.Unmarshal(contractBytes, &contract)
	if err != nil {
		return fmt.Errorf("failed to unmarshal contract: %v", err)
	}

	// Update contract status
	contract.Status = "rejected"
	contract.UpdatedAt = time.Now().Format(time.RFC3339)

	// Add rejection to history
	contract.History = append(contract.History, History{
		Action:      "rejected",
		PerformedBy: rejectedBy,
		PerformedAt: rejectedAt,
		Comment:     "Contract rejected",
	})

	// Store updated contract
	updatedContractBytes, err := json.Marshal(contract)
	if err != nil {
		return fmt.Errorf("failed to marshal rejected contract: %v", err)
	}

	err = ctx.GetStub().PutState(contractID, updatedContractBytes)
	if err != nil {
		return fmt.Errorf("failed to put rejected contract to world state: %v", err)
	}

	// Update composite key
	contractKey, err := ctx.GetStub().CreateCompositeKey("contract", []string{contract.Status, contract.ID})
	if err != nil {
		return fmt.Errorf("failed to create composite key: %v", err)
	}

	err = ctx.GetStub().PutState(contractKey, updatedContractBytes)
	if err != nil {
		return fmt.Errorf("failed to put contract composite key: %v", err)
	}

	return nil
}

// GetContract retrieves a contract by ID
func (s *ContractChaincode) GetContract(ctx contractapi.TransactionContextInterface, contractID string) (*Contract, error) {
	contractBytes, err := ctx.GetStub().GetState(contractID)
	if err != nil {
		return nil, fmt.Errorf("failed to read contract from world state: %v", err)
	}
	if contractBytes == nil {
		return nil, fmt.Errorf("contract %s does not exist", contractID)
	}

	var contract Contract
	err = json.Unmarshal(contractBytes, &contract)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal contract: %v", err)
	}

	return &contract, nil
}

// GetAllContracts retrieves all contracts
func (s *ContractChaincode) GetAllContracts(ctx contractapi.TransactionContextInterface) ([]*Contract, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get state by range: %v", err)
	}
	defer resultsIterator.Close()

	var contracts []*Contract
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next result: %v", err)
		}

		// Skip composite keys
		if len(queryResponse.Key) > 0 && queryResponse.Key[0] == '\x00' {
			continue
		}

		var contract Contract
		err = json.Unmarshal(queryResponse.Value, &contract)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal contract: %v", err)
		}

		contracts = append(contracts, &contract)
	}

	return contracts, nil
}

// GetContractHistory retrieves the history of a contract
func (s *ContractChaincode) GetContractHistory(ctx contractapi.TransactionContextInterface, contractID string) ([]*Contract, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(contractID)
	if err != nil {
		return nil, fmt.Errorf("failed to get history for key: %v", err)
	}
	defer resultsIterator.Close()

	var history []*Contract
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next history result: %v", err)
		}

		var contract Contract
		err = json.Unmarshal(queryResponse.Value, &contract)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal contract history: %v", err)
		}

		history = append(history, &contract)
	}

	return history, nil
}

// GetContractsByStatus retrieves contracts by status
func (s *ContractChaincode) GetContractsByStatus(ctx contractapi.TransactionContextInterface, status string) ([]*Contract, error) {
	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("contract", []string{status})
	if err != nil {
		return nil, fmt.Errorf("failed to get state by partial composite key: %v", err)
	}
	defer resultsIterator.Close()

	var contracts []*Contract
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next result: %v", err)
		}

		var contract Contract
		err = json.Unmarshal(queryResponse.Value, &contract)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal contract: %v", err)
		}

		contracts = append(contracts, &contract)
	}

	return contracts, nil
}

// GetContractStats retrieves contract statistics
func (s *ContractChaincode) GetContractStats(ctx contractapi.TransactionContextInterface) (map[string]interface{}, error) {
	contracts, err := s.GetAllContracts(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all contracts: %v", err)
	}

	stats := make(map[string]interface{})
	stats["totalContracts"] = len(contracts)

	statusCount := make(map[string]int)
	totalValue := 0.0
	contractTypes := make(map[string]int)

	for _, contract := range contracts {
		statusCount[contract.Status]++
		totalValue += contract.ContractValue
		contractTypes[contract.ContractType]++
	}

	stats["statusBreakdown"] = statusCount
	stats["totalValue"] = totalValue
	stats["averageValue"] = totalValue / float64(len(contracts))
	stats["typeBreakdown"] = contractTypes

	return stats, nil
}

func main() {
	contractChaincode, err := contractapi.NewChaincode(&ContractChaincode{})
	if err != nil {
		fmt.Printf("Error creating contract chaincode: %v", err)
		return
	}

	if err := contractChaincode.Start(); err != nil {
		fmt.Printf("Error starting contract chaincode: %v", err)
	}
}
