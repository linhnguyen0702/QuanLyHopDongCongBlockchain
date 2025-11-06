import React, { useState, useEffect } from "react";
import {
  Snackbar,
  Alert,
  LinearProgress,
  Box,
  Typography,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

/**
 * BlockchainProgressNotification
 * Hiển thị progress khi đang xử lý blockchain transaction
 */
const BlockchainProgressNotification = ({ show, message, onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (show) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 95) {
            return 95; // Dừng ở 95%, chờ thật sự hoàn thành
          }
          return Math.min(oldProgress + 5, 95);
        });
      }, 1000); // Tăng 5% mỗi giây

      return () => {
        clearInterval(timer);
      };
    }
  }, [show]);

  // Reset progress khi đóng
  useEffect(() => {
    if (!show) {
      setProgress(0);
    }
  }, [show]);

  return (
    <Snackbar
      open={show}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: 24 }}
    >
      <Alert
        icon={<InfoIcon />}
        severity="info"
        sx={{
          width: "400px",
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {message || "Đang xử lý giao dịch blockchain..."}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 6, borderRadius: 1 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            Vui lòng đợi 15-20 giây để blockchain xác nhận giao dịch...
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default BlockchainProgressNotification;
