import React from 'react';
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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { contractAPI } from '../../services/api';
import toast from 'react-hot-toast';

const validationSchema = yup.object({
  contractNumber: yup.string().required('Số hợp đồng là bắt buộc'),
  contractName: yup.string().required('Tên hợp đồng là bắt buộc'),
  contractor: yup.string().required('Nhà thầu là bắt buộc'),
  contractValue: yup.number().positive('Giá trị hợp đồng phải lớn hơn 0').required('Giá trị hợp đồng là bắt buộc'),
  startDate: yup.date().required('Ngày bắt đầu là bắt buộc'),
  endDate: yup.date().min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu').required('Ngày kết thúc là bắt buộc'),
  contractType: yup.string().required('Loại hợp đồng là bắt buộc'),
  department: yup.string().required('Phòng ban là bắt buộc'),
  responsiblePerson: yup.string().required('Người phụ trách là bắt buộc'),
});

const CreateContract = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: {
      contractNumber: '',
      contractName: '',
      contractor: '',
      contractValue: '',
      currency: 'VND',
      startDate: null,
      endDate: null,
      description: '',
      contractType: '',
      department: '',
      responsiblePerson: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const contractData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };
      
      createContractMutation.mutate(contractData);
    },
  });

  const createContractMutation = useMutation(
    (contractData) => contractAPI.createContract(contractData),
    {
      onSuccess: (response) => {
        console.log('Create contract response:', response.data);
        queryClient.invalidateQueries('contracts');
        toast.success('Tạo hợp đồng thành công!');
        navigate(`/contracts/${response.data.data.contract._id}`);
      },
      onError: (error) => {
        console.error('Create contract error:', error);
        toast.error(error.response?.data?.message || 'Tạo hợp đồng thất bại!');
      },
    }
  );

  const contractTypes = [
    { value: 'construction', label: 'Xây dựng' },
    { value: 'supply', label: 'Cung cấp' },
    { value: 'service', label: 'Dịch vụ' },
    { value: 'consulting', label: 'Tư vấn' },
  ];

  const currencies = [
    { value: 'VND', label: 'VND' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/contracts')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
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
                    error={formik.touched.contractNumber && Boolean(formik.errors.contractNumber)}
                    helperText={formik.touched.contractNumber && formik.errors.contractNumber}
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
                    error={formik.touched.contractName && Boolean(formik.errors.contractName)}
                    helperText={formik.touched.contractName && formik.errors.contractName}
                  />
                </Grid>

                {/* Contractor */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nhà thầu"
                    name="contractor"
                    value={formik.values.contractor}
                    onChange={formik.handleChange}
                    error={formik.touched.contractor && Boolean(formik.errors.contractor)}
                    helperText={formik.touched.contractor && formik.errors.contractor}
                  />
                </Grid>

                {/* Contract Type */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.contractType && Boolean(formik.errors.contractType)}>
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
                  {formik.touched.contractType && formik.errors.contractType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
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
                    error={formik.touched.contractValue && Boolean(formik.errors.contractValue)}
                    helperText={formik.touched.contractValue && formik.errors.contractValue}
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
                    error={formik.touched.department && Boolean(formik.errors.department)}
                    helperText={formik.touched.department && formik.errors.department}
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
                    error={formik.touched.responsiblePerson && Boolean(formik.errors.responsiblePerson)}
                    helperText={formik.touched.responsiblePerson && formik.errors.responsiblePerson}
                  />
                </Grid>

                {/* Start Date */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={formik.values.startDate}
                    onChange={(date) => formik.setFieldValue('startDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                        helperText={formik.touched.startDate && formik.errors.startDate}
                      />
                    )}
                  />
                </Grid>

                {/* End Date */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày kết thúc"
                    value={formik.values.endDate}
                    onChange={(date) => formik.setFieldValue('endDate', date)}
                    minDate={formik.values.startDate}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                        helperText={formik.touched.endDate && formik.errors.endDate}
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
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/contracts')}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={createContractMutation.isLoading}
                    >
                      {createContractMutation.isLoading ? 'Đang tạo...' : 'Tạo hợp đồng'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateContract;
