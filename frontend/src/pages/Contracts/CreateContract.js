import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { contractAPI, contractorAPI } from "../../services/api";
import BlockchainProgressNotification from "../../components/Common/BlockchainProgressNotification";
import TransactionSuccessDialog from "../../components/Blockchain/TransactionSuccessDialog";
import userBlockchainService from "../../services/userBlockchainService";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const validationSchema = yup.object({
  contractNumber: yup.string().required("Số hợp đồng là bắt buộc"),
  contractName: yup.string().required("Tên hợp đồng là bắt buộc"),
  contractor: yup.string().required("Nhà thầu là bắt buộc"),
  contractValue: yup
    .number()
    .positive("Giá trị hợp đồng phải lớn hơn 0")
    .required("Giá trị hợp đồng là bắt buộc"),
  startDate: yup.date().required("Ngày bắt đầu là bắt buộc"),
  endDate: yup
    .date()
    .min(yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu")
    .required("Ngày kết thúc là bắt buộc"),
  contractType: yup.string().required("Loại hợp đồng là bắt buộc"),
  department: yup.string().required("Phòng ban là bắt buộc"),
  responsiblePerson: yup.string().required("Người phụ trách là bắt buộc"),
});

const CreateContract = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showBlockchainProgress, setShowBlockchainProgress] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState({
    open: false,
    transactionHash: null,
  });
  const [blockchainMessage, setBlockchainMessage] = useState("");
  const [userAddress, setUserAddress] = useState(null);

  // Fetch danh sách nhà thầu (ưu tiên trạng thái active)
  const { data: contractorsData, isLoading: contractorsLoading } = useQuery(
    ["contractors", { status: "active" }],
    () =>
      contractorAPI.getContractors({ status: "active", page: 1, limit: 1000 }),
    { keepPreviousData: true }
  );

  const formik = useFormik({
    initialValues: {
      contractNumber: "",
      contractName: "",
      contractor: "",
      contractValue: "",
      currency: "VND",
      startDate: null,
      endDate: null,
      description: "",
      contractType: "",
      department: "",
      responsiblePerson: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const contractData = {
        ...values,
        status: "pending", // Gửi trạng thái 'pending' (Chờ phê duyệt)
        startDate: values.startDate
          ? values.startDate.toISOString()
          : undefined,
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      };

      // USER WALLET SIGNING - Gọi MetaMask để user ký transaction
      try {
        setShowBlockchainProgress(true);
        setBlockchainMessage("Đang kết nối MetaMask...");

        // 1. Kết nối ví nếu chưa kết nối
        if (!userAddress) {
          toast.loading("Vui lòng kết nối MetaMask...", {
            id: "wallet-connect",
          });
          const address = await userBlockchainService.connectWallet();
          setUserAddress(address);
          toast.success("Đã kết nối ví!", { id: "wallet-connect" });
        }

        // 2. Verify wallet address khớp với profile
        if (user.walletAddress) {
          setBlockchainMessage("Đang xác thực địa chỉ ví...");
          try {
            await userBlockchainService.verifyWalletAddress(user.walletAddress);
            toast.success("Địa chỉ ví đã được xác thực!", {
              id: "wallet-verify",
            });
          } catch (verifyError) {
            toast.error(verifyError.message, { duration: 6000 });
            throw verifyError;
          }
        } else {
          toast.warning(
            "Bạn chưa cập nhật địa chỉ ví trong Profile. Transaction vẫn sẽ được thực hiện.",
            { duration: 4000 }
          );
        }

        // 3. User ký transaction trên blockchain
        setBlockchainMessage("Vui lòng xác nhận giao dịch trong MetaMask...");
        toast.loading("Chờ xác nhận từ MetaMask...", { id: "tx-sign" });

        const txResult = await userBlockchainService.createContract(
          contractData
        );

        toast.success("Đã ký giao dịch thành công!", { id: "tx-sign" });
        setBlockchainMessage("Đang lưu thông tin hợp đồng...");

        // 3. Gửi thông tin + transaction hash về backend
        const dataWithBlockchain = {
          ...contractData,
          blockchain: {
            transactionHash: txResult.transactionHash,
            blockNumber: txResult.blockNumber,
            contractAddress: txResult.contractAddress,
          },
        };

        createContractMutation.mutate(dataWithBlockchain);
      } catch (error) {
        setShowBlockchainProgress(false);
        console.error("User wallet signing error:", error);

        if (error.code === 4001) {
          toast.error("Bạn đã từ chối giao dịch trong MetaMask");
        } else if (error.message?.includes("insufficient funds")) {
          toast.error(
            "Không đủ ETH để trả phí gas. Vui lòng nạp thêm Sepolia ETH"
          );
        } else {
          toast.error(
            error.message || "Không thể thực hiện giao dịch blockchain"
          );
        }
      }
    },
  });

  const createContractMutation = useMutation(
    (contractData) => contractAPI.createContract(contractData),
    {
      onMutate: (variables) => {
        // Không cần hiển thị progress vì đã xử lý ở onSubmit
      },
      onSuccess: (response, variables) => {
        // Ẩn notification
        setShowBlockchainProgress(false);

        console.log("Create contract response:", response.data);
        queryClient.invalidateQueries("contracts");

        const contract = response.data.data.contract;

        // Transaction đã được xử lý ở onSubmit, chỉ cần hiển thị kết quả
        if (contract?.blockchain?.transactionHash) {
          console.log(
            "✅ Contract saved with blockchain transaction:",
            contract.blockchain.transactionHash
          );

          toast.success("Tạo hợp đồng và lưu lên blockchain thành công!", {
            duration: 3000,
            id: `create-contract-${contract._id}`,
          });

          // Mở dialog chi tiết transaction
          setTransactionDialog({
            open: true,
            transactionHash: contract.blockchain.transactionHash,
          });
        } else {
          toast.success("Tạo hợp đồng thành công!");
          // Navigate ngay nếu không có blockchain
          setTimeout(() => {
            navigate(`/contracts/${response.data.data.contract._id}`);
          }, 1000);
        }
      },
      onError: (error, variables) => {
        setShowBlockchainProgress(false);
        console.error("Create contract error:", error);
        console.error("Error response:", error.response?.data);

        // Hiển thị chi tiết lỗi validation nếu có
        if (
          error.response?.data?.details &&
          Array.isArray(error.response.data.details)
        ) {
          error.response.data.details.forEach((detail) => {
            toast.error(detail);
          });
        } else {
          toast.error(
            error.response?.data?.message || "Tạo hợp đồng thất bại!"
          );
        }
      },
    }
  );

  const contractTypes = [
    { value: "construction", label: "Xây dựng" },
    { value: "supply", label: "Cung cấp" },
    { value: "service", label: "Dịch vụ" },
    { value: "consulting", label: "Tư vấn" },
  ];

  const currencies = [
    { value: "VND", label: "VND" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  // Lưu bản nháp: không chạy validate bắt buộc, trạng thái = DRAFT
  const handleSaveDraft = () => {
    const values = formik.values;
    const contractData = {
      ...values,
      status: "draft",
      startDate: values.startDate ? values.startDate.toISOString() : undefined,
      endDate: values.endDate ? values.endDate.toISOString() : undefined,
    };
    createContractMutation.mutate(contractData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/contracts")}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            Tạo hợp đồng mới
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                {/* Contract Number */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số hợp đồng"
                    name="contractNumber"
                    value={formik.values.contractNumber}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.contractNumber &&
                      Boolean(formik.errors.contractNumber)
                    }
                    helperText={
                      formik.touched.contractNumber &&
                      formik.errors.contractNumber
                    }
                  />
                </Grid>

                {/* Contract Name */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên hợp đồng"
                    name="contractName"
                    value={formik.values.contractName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.contractName &&
                      Boolean(formik.errors.contractName)
                    }
                    helperText={
                      formik.touched.contractName && formik.errors.contractName
                    }
                  />
                </Grid>

                {/* Contractor */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={(
                      contractorsData?.data?.data?.contractors || []
                    ).filter((c) => c.status === "active")}
                    getOptionLabel={(option) => option?.contractorName || ""}
                    value={
                      (contractorsData?.data?.data?.contractors || []).find(
                        (c) => c.contractorName === formik.values.contractor
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      formik.setFieldValue(
                        "contractor",
                        newValue ? newValue.contractorName : ""
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Nhà thầu"
                        error={
                          formik.touched.contractor &&
                          Boolean(formik.errors.contractor)
                        }
                        helperText={
                          formik.touched.contractor && formik.errors.contractor
                        }
                      />
                    )}
                    loading={contractorsLoading}
                    noOptionsText={
                      contractorsLoading
                        ? "Đang tải..."
                        : "Không có nhà thầu phù hợp"
                    }
                  />
                </Grid>

                {/* Contract Type */}
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.contractType &&
                      Boolean(formik.errors.contractType)
                    }
                  >
                    <InputLabel>Loại hợp đồng</InputLabel>
                    <Select
                      name="contractType"
                      value={formik.values.contractType}
                      onChange={formik.handleChange}
                      label="Loại hợp đồng"
                    >
                      {contractTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formik.touched.contractType &&
                    formik.errors.contractType && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 2 }}
                      >
                        {formik.errors.contractType}
                      </Typography>
                    )}
                </Grid>

                {/* Contract Value */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Giá trị hợp đồng"
                    name="contractValue"
                    type="number"
                    value={formik.values.contractValue}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.contractValue &&
                      Boolean(formik.errors.contractValue)
                    }
                    helperText={
                      formik.touched.contractValue &&
                      formik.errors.contractValue
                    }
                  />
                </Grid>

                {/* Currency */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Tiền tệ</InputLabel>
                    <Select
                      name="currency"
                      value={formik.values.currency}
                      onChange={formik.handleChange}
                      label="Tiền tệ"
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Department */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phòng ban"
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.department &&
                      Boolean(formik.errors.department)
                    }
                    helperText={
                      formik.touched.department && formik.errors.department
                    }
                  />
                </Grid>

                {/* Responsible Person */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Người phụ trách"
                    name="responsiblePerson"
                    value={formik.values.responsiblePerson}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.responsiblePerson &&
                      Boolean(formik.errors.responsiblePerson)
                    }
                    helperText={
                      formik.touched.responsiblePerson &&
                      formik.errors.responsiblePerson
                    }
                  />
                </Grid>

                {/* Start Date */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={formik.values.startDate}
                    onChange={(date) => formik.setFieldValue("startDate", date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={
                          formik.touched.startDate &&
                          Boolean(formik.errors.startDate)
                        }
                        helperText={
                          formik.touched.startDate && formik.errors.startDate
                        }
                      />
                    )}
                  />
                </Grid>

                {/* End Date */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày kết thúc"
                    value={formik.values.endDate}
                    onChange={(date) => formik.setFieldValue("endDate", date)}
                    minDate={formik.values.startDate}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={
                          formik.touched.endDate &&
                          Boolean(formik.errors.endDate)
                        }
                        helperText={
                          formik.touched.endDate && formik.errors.endDate
                        }
                      />
                    )}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    name="description"
                    multiline
                    rows={4}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.description &&
                      Boolean(formik.errors.description)
                    }
                    helperText={
                      formik.touched.description && formik.errors.description
                    }
                  />
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/contracts")}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleSaveDraft}
                      disabled={createContractMutation.isLoading}
                    >
                      {createContractMutation.isLoading
                        ? "Đang lưu..."
                        : "Lưu bản nháp"}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={createContractMutation.isLoading}
                    >
                      {createContractMutation.isLoading
                        ? "Đang tạo..."
                        : "Tạo hợp đồng"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Blockchain Progress Notification */}
      <BlockchainProgressNotification
        show={showBlockchainProgress}
        message={blockchainMessage}
        onClose={() => setShowBlockchainProgress(false)}
      />

      {/* Transaction Success Dialog */}
      <TransactionSuccessDialog
        open={transactionDialog.open}
        onClose={() => {
          setTransactionDialog({ open: false, transactionHash: null });
          // Navigate sau khi đóng dialog
          navigate(`/contracts`);
        }}
        transactionHash={transactionDialog.transactionHash}
        title="Tạo hợp đồng thành công"
        message="Hợp đồng đã được lưu lên blockchain"
        network="sepolia"
      />
    </LocalizationProvider>
  );
};

export default CreateContract;
