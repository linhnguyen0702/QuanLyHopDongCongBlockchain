const express = require("express");
const Contract = require("../models/Contract");
const { validate, schemas } = require("../middleware/validation");
const { authenticateToken, requireManager } = require("../middleware/auth");
const blockchainService = require("../services/blockchainService");
const AuditLog = require("../models/AuditLog");
const router = express.Router();

// @route   GET /api/contracts
// @desc    Get all contracts with pagination and filtering
// @access  Private
router.get(
  "/",
  authenticateToken,
  validate(schemas.pagination),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        status,
        contractType,
        department,
      } = req.query;

      const filter = {};
      if (search) {
        filter.$or = [
          { contractNumber: { $regex: search, $options: "i" } },
          { contractName: { $regex: search, $options: "i" } },
          { contractor: { $regex: search, $options: "i" } },
        ];
      }
      if (status) {
        filter.status = status;
      } else {
        filter.status = { $ne: "deleted" };
      }
      if (contractType) filter.contractType = contractType;
      if (department) filter.department = department;

      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      const skip = (page - 1) * limit;

      const contracts = await Contract.find(filter)
        .populate("createdBy", "username fullName email")
        .populate("approvedBy", "username fullName email")
        .populate("approvals.approvedBy", "username fullName email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Contract.countDocuments(filter);

      res.json({
        status: "success",
        data: {
          contracts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get contracts error:", error);
      res.status(500).json({
        status: "error",
        message: "Không thể tải danh sách hợp đồng",
      });
    }
  }
);

// @route   GET /api/contracts/:id
// @desc    Get contract by ID
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("createdBy", "username fullName email")
      .populate("approvedBy", "username fullName email")
      .populate("approvals.approvedBy", "username fullName email")
      .populate("history.performedBy", "username fullName email");

    if (!contract) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy hợp đồng",
      });
    }

    res.json({
      status: "success",
      data: { contract },
    });
  } catch (error) {
    console.error("Get contract error:", error);
    res.status(500).json({
      status: "error",
      message: "Không thể tải thông tin hợp đồng",
    });
  }
});

// @route   POST /api/contracts
// @desc    Create new contract
// @access  Private
router.post(
  "/",
  authenticateToken,
  validate(schemas.createContract),
  async (req, res) => {
    try {
      const contractData = {
        ...req.body,
        createdBy: req.user._id,
      };

      const contract = new Contract(contractData);

      contract.history.push({
        action: "created",
        performedBy: req.user._id,
        comment: "Hợp đồng đã được tạo.",
      });

      await AuditLog.createLog({
        type: "contract",
        action: "created",
        description: `Hợp đồng "${contract.contractName}" đã được tạo.`,
        performedBy: req.user._id,
        resourceId: contract._id,
        resourceType: "Contract",
      });

      await contract.save();
      await contract.populate("createdBy", "username fullName email");

      // ✅ XỬ LÝ BLOCKCHAIN
      // Nếu frontend đã gửi blockchain data (user đã ký), chỉ cần lưu vào DB
      if (req.body.blockchain && req.body.blockchain.transactionHash) {
        console.log(
          `✅ Frontend đã xử lý blockchain: ${req.body.blockchain.transactionHash}`
        );
        contract.blockchain = {
          enabled: true,
          transactionHash: req.body.blockchain.transactionHash,
          blockNumber: req.body.blockchain.blockNumber,
          contractAddress: req.body.blockchain.contractAddress,
          network: "sepolia",
          createdOnChain: new Date(),
          lastSyncedAt: new Date(),
        };
        await contract.save();
      }
      // Nếu không có blockchain data từ frontend, dùng backend service (fallback)
      else if (blockchainService.isEnabled()) {
        try {
          console.log(
            `🔄 Đang lưu hợp đồng ${contract.contractNumber} lên blockchain (backend wallet)...`
          );

          const blockchainResult = await blockchainService.createContract({
            contractNumber: contract.contractNumber,
            contractName: contract.contractName,
            contractor: contract.contractor,
            contractValue: contract.contractValue,
            currency: contract.currency,
            startDate: contract.startDate,
            endDate: contract.endDate,
            contractType: contract.contractType,
            department: contract.department,
            responsiblePerson: contract.responsiblePerson,
          });

          if (blockchainResult) {
            contract.blockchain = {
              enabled: true,
              transactionHash: blockchainResult.transactionHash,
              blockNumber: blockchainResult.blockNumber,
              contractAddress: blockchainResult.contractAddress,
              network: blockchainResult.network,
              createdOnChain: new Date(),
              lastSyncedAt: new Date(),
            };
            await contract.save();
            console.log(
              `✅ Blockchain sync completed for ${contract.contractNumber}`
            );
            console.log(
              `📝 Transaction hash: ${blockchainResult.transactionHash}`
            );
          }
        } catch (blockchainError) {
          console.error("❌ Blockchain error (non-critical):", blockchainError);
          // Không throw error, chỉ log - vẫn trả về contract đã tạo
        }
      }

      // ✅ BÂY GIỜ MỚI TRẢ RESPONSE (đã có blockchain data)
      res.status(201).json({
        status: "success",
        message: "Tạo hợp đồng thành công",
        data: { contract },
      });
    } catch (error) {
      console.error("Lỗi khi tạo hợp đồng:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          status: "error",
          message: "Số hợp đồng đã tồn tại",
        });
      }
      res.status(500).json({
        status: "error",
        message: "Không thể tạo hợp đồng",
      });
    }
  }
);

// @route   PUT /api/contracts/:id
// @desc    Update contract
// @access  Private
router.put(
  "/:id",
  authenticateToken,
  validate(schemas.updateContract),
  async (req, res) => {
    try {
      const contractToUpdate = await Contract.findById(req.params.id);

      if (!contractToUpdate) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy hợp đồng",
        });
      }

      if (
        contractToUpdate.createdBy.toString() !== req.user._id.toString() &&
        !["admin", "manager"].includes(req.user.role)
      ) {
        return res.status(403).json({
          status: "error",
          message: "Không được phép cập nhật hợp đồng này",
        });
      }

      let updateData = { ...req.body };
      if (["approved", "active"].includes(contractToUpdate.status)) {
        const allowedUpdates = {
          contractName: req.body.contractName,
          description: req.body.description,
          department: req.body.department,
          responsiblePerson: req.body.responsiblePerson,
        };
        updateData = allowedUpdates;
      }

      const originalValues = {};
      Object.keys(updateData).forEach((key) => {
        originalValues[key] = contractToUpdate[key];
      });

      Object.assign(contractToUpdate, updateData);

      contractToUpdate.history.push({
        action: "updated",
        performedBy: req.user._id,
        comment: "Hợp đồng đã được cập nhật.",
        changes: { from: originalValues, to: updateData },
      });

      await AuditLog.createLog({
        type: "contract",
        action: "updated",
        description: `Hợp đồng "${contractToUpdate.contractName}" đã được cập nhật.`,
        performedBy: req.user._id,
        resourceId: contractToUpdate._id,
        resourceType: "Contract",
      });

      const savedContract = await contractToUpdate.save();
      const updatedContract = await savedContract.populate([
        { path: "createdBy", select: "username fullName email" },
        { path: "approvedBy", select: "username fullName email" },
      ]);

      // ✅ XỬ LÝ BLOCKCHAIN
      // Nếu frontend đã gửi blockchain data (user đã ký), chỉ cần lưu vào DB
      if (req.body.blockchain && req.body.blockchain.transactionHash) {
        console.log(
          `✅ Frontend đã xử lý blockchain: ${req.body.blockchain.transactionHash}`
        );
        updatedContract.blockchain = {
          enabled: true,
          transactionHash: req.body.blockchain.transactionHash,
          blockNumber: req.body.blockchain.blockNumber,
          contractAddress: req.body.blockchain.contractAddress,
          network: "sepolia",
          lastSyncedAt: new Date(),
        };
        // Giữ nguyên createdOnChain nếu đã có
        if (contractToUpdate.blockchain?.createdOnChain) {
          updatedContract.blockchain.createdOnChain =
            contractToUpdate.blockchain.createdOnChain;
        } else {
          updatedContract.blockchain.createdOnChain = new Date();
        }
        await updatedContract.save();
      }
      // Nếu không có blockchain data từ frontend, dùng backend service (fallback)
      else if (blockchainService.isEnabled()) {
        try {
          const contractDataForChain = {
            contractNumber: updatedContract.contractNumber,
            contractName: updatedContract.contractName,
            contractor: updatedContract.contractor,
            contractValue: updatedContract.contractValue,
            currency: updatedContract.currency,
            startDate: updatedContract.startDate,
            endDate: updatedContract.endDate,
            contractType: updatedContract.contractType,
            department: updatedContract.department,
            responsiblePerson: updatedContract.responsiblePerson,
          };

          // If contract is not yet on the blockchain, create it. Otherwise, update it.
          if (
            !updatedContract.blockchain ||
            !updatedContract.blockchain.enabled
          ) {
            console.log(
              `🔄 Creating contract ${updatedContract.contractNumber} on blockchain for the first time (backend wallet).`
            );

            const blockchainResult = await blockchainService.createContract(
              contractDataForChain
            );

            if (blockchainResult) {
              updatedContract.blockchain = {
                enabled: true,
                transactionHash: blockchainResult.transactionHash,
                blockNumber: blockchainResult.blockNumber,
                contractAddress: blockchainResult.contractAddress,
                network: blockchainResult.network,
                createdOnChain: new Date(),
                lastSyncedAt: new Date(),
              };
              await updatedContract.save();
              console.log(
                `✅ Blockchain CREATION sync completed for ${updatedContract.contractNumber}`
              );
              console.log(
                `📝 Transaction hash: ${blockchainResult.transactionHash}`
              );
            }
          } else {
            console.log(
              `🔄 Updating contract ${updatedContract.contractNumber} on blockchain (backend wallet).`
            );

            const blockchainResult = await blockchainService.updateContract(
              updatedContract.contractNumber,
              contractDataForChain
            );

            if (blockchainResult && blockchainResult.success) {
              updatedContract.blockchain.transactionHash =
                blockchainResult.transactionHash;
              updatedContract.blockchain.blockNumber =
                blockchainResult.blockNumber;
              updatedContract.blockchain.lastSyncedAt = new Date();
              await updatedContract.save();
              console.log(
                `✅ Blockchain UPDATE sync completed for ${updatedContract.contractNumber}`
              );
              console.log(
                `📝 Transaction hash: ${blockchainResult.transactionHash}`
              );
            }
          }
        } catch (blockchainError) {
          console.error("❌ Blockchain error (non-critical):", blockchainError);
          // Không throw error - vẫn trả về contract đã update
        }
      }

      // ✅ BÂY GIỜ MỚI TRẢ RESPONSE (đã có blockchain data)
      res.json({
        status: "success",
        message: "Cập nhật hợp đồng thành công",
        data: { contract: updatedContract },
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật hợp đồng:", error);
      res.status(500).json({
        status: "error",
        message: "Không thể cập nhật hợp đồng",
      });
    }
  }
);

// @route   POST /api/contracts/:id/approve
// @desc    Approve contract (requires 2 approvals)
// @access  Private (Manager/Admin only)
router.post(
  "/:id/approve",
  authenticateToken,
  requireManager,
  async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);

      if (!contract) {
        return res
          .status(404)
          .json({ status: "error", message: "Không tìm thấy hợp đồng" });
      }
      if (contract.status !== "pending") {
        return res.status(400).json({
          status: "error",
          message: "Chỉ có hợp đồng chờ phê duyệt mới được phê duyệt",
        });
      }

      // Check if user already approved
      const alreadyApproved = contract.approvals.some(
        (approval) => approval.approvedBy.toString() === req.user._id.toString()
      );

      if (alreadyApproved) {
        return res.status(400).json({
          status: "error",
          message: "Bạn đã phê duyệt hợp đồng này rồi",
        });
      }

      // Add approval
      contract.approvals.push({
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comment: req.body.comment || "Đã phê duyệt",
      });

      // Check if we have 2 approvals now
      const approvalCount = contract.approvals.length;
      let message = "";
      let historyAction = "";

      if (approvalCount >= 2) {
        // Second approval - change status to approved
        contract.status = "approved";
        contract.approvedBy = req.user._id; // Last approver
        contract.approvedAt = new Date();
        message = "Hợp đồng đã được phê duyệt hoàn tất (2/2)";
        historyAction = "approved";

        contract.history.push({
          action: "approved",
          performedBy: req.user._id,
          comment:
            req.body.comment || "Hợp đồng đã được phê duyệt đầy đủ (2/2).",
        });

        // 🔗 LƯU LÊN BLOCKCHAIN
        // Nếu frontend đã gửi blockchain data (user đã ký), chỉ cần lưu vào DB
        if (req.body.blockchain && req.body.blockchain.transactionHash) {
          console.log(
            `✅ Frontend đã xử lý blockchain approval: ${req.body.blockchain.transactionHash}`
          );
          contract.blockchainTxHash = req.body.blockchain.transactionHash;
        }
        // Nếu không có blockchain data từ frontend, dùng backend service (fallback)
        else if (blockchainService.isEnabled()) {
          try {
            const approverName =
              req.user.fullName || req.user.username || "Unknown";
            const comment =
              req.body.comment || "Hợp đồng đã được phê duyệt đầy đủ (2/2)";

            // Kiểm tra contract có tồn tại trên blockchain không
            const exists = await blockchainService.doesContractExist(
              contract.contractNumber
            );

            if (!exists) {
              console.log(
                `⚠️ Contract ${contract.contractNumber} chưa có trên blockchain, đang tạo...`
              );

              // Tạo contract trên blockchain trước
              const createResult = await blockchainService.createContract({
                contractNumber: contract.contractNumber,
                contractName: contract.contractName,
                contractor: contract.contractor,
                contractValue: contract.contractValue,
                currency: contract.currency,
                startDate: contract.startDate,
                endDate: contract.endDate,
                contractType: contract.contractType,
                department: contract.department,
                responsiblePerson: contract.responsiblePerson,
              });

              console.log(
                `✅ Contract created on blockchain: ${createResult.transactionHash}`
              );
              console.log(
                `⏳ Đợi transaction confirm (có thể mất 15-20 giây)...`
              );

              // ĐỢI TRANSACTION CONFIRM - QUAN TRỌNG!
              // Không dùng setTimeout mà đợi thật sự transaction được mine
              const provider = blockchainService.provider;
              let confirmed = false;
              let attempts = 0;
              const maxAttempts = 30; // 30 lần x 2 giây = 60 giây timeout

              while (!confirmed && attempts < maxAttempts) {
                try {
                  const receipt = await provider.getTransactionReceipt(
                    createResult.transactionHash
                  );
                  if (receipt && receipt.status === 1) {
                    confirmed = true;
                    console.log(
                      `✅ Transaction confirmed in block ${receipt.blockNumber}`
                    );
                  } else if (receipt && receipt.status === 0) {
                    throw new Error("Transaction failed");
                  }
                } catch (error) {
                  // Transaction chưa được mine, tiếp tục đợi
                }

                if (!confirmed) {
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                  attempts++;
                  if (attempts % 5 === 0) {
                    console.log(`⏳ Vẫn đang đợi... (${attempts * 2}s)`);
                  }
                }
              }

              if (!confirmed) {
                throw new Error(
                  "Transaction timeout - vui lòng thử phê duyệt lại sau"
                );
              }

              console.log(
                `✅ Contract đã được tạo và confirmed, tiếp tục phê duyệt...`
              );
            }

            // Phê duyệt contract trên blockchain
            const txHash = await blockchainService.approveContract(
              contract.contractNumber,
              approverName,
              comment
            );

            if (txHash) {
              contract.blockchainTxHash = txHash;
              console.log(`✅ Approval saved to blockchain: ${txHash}`);
            }
          } catch (blockchainError) {
            console.error("Blockchain approval error:", blockchainError);
            // Không fail request nếu blockchain lỗi, chỉ log
            console.log(
              "⚠️ Approval saved to MongoDB only (blockchain failed)"
            );
          }
        }

        await AuditLog.createLog({
          type: "contract",
          action: "approved",
          description: `Hợp đồng "${contract.contractName}" đã được phê duyệt hoàn tất (2/2).`,
          details: req.body.comment || "Không có bình luận",
          performedBy: req.user._id,
          resourceId: contract._id,
          resourceType: "Contract",
        });
      } else {
        // First approval - keep status as pending
        message = `Hợp đồng đã được phê duyệt lần ${approvalCount}/2. Cần thêm 1 phê duyệt nữa.`;
        historyAction = "partial_approved";

        contract.history.push({
          action: "updated",
          performedBy: req.user._id,
          comment: req.body.comment || `Phê duyệt lần ${approvalCount}/2.`,
        });

        await AuditLog.createLog({
          type: "contract",
          action: "updated",
          description: `Hợp đồng "${contract.contractName}" đã được phê duyệt lần ${approvalCount}/2.`,
          details: req.body.comment || "Không có bình luận",
          performedBy: req.user._id,
          resourceId: contract._id,
          resourceType: "Contract",
        });
      }

      await contract.save();
      await contract.populate([
        { path: "approvals.approvedBy", select: "username fullName email" },
        { path: "approvedBy", select: "username fullName email" },
      ]);

      // ✅ TRẢ RESPONSE SAU KHI ĐÃ CÓ BLOCKCHAIN DATA
      res.json({
        status: "success",
        message: message,
        data: {
          contract,
          approvalCount: approvalCount,
          requiredApprovals: 2,
          isFullyApproved: approvalCount >= 2,
          blockchainCompleted: !!contract.blockchainTxHash, // ✅ Đã xử lý xong blockchain
        },
      });
    } catch (error) {
      console.error("Lỗi khi phê duyệt hợp đồng:", error);
      res
        .status(500)
        .json({ status: "error", message: "Không thể phê duyệt hợp đồng" });
    }
  }
);

// @route   POST /api/contracts/:id/reject
// @desc    Reject contract
// @access  Private (Manager/Admin only)
router.post(
  "/:id/reject",
  authenticateToken,
  requireManager,
  async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);

      if (!contract) {
        return res
          .status(404)
          .json({ status: "error", message: "Không tìm thấy hợp đồng" });
      }
      if (contract.status !== "pending") {
        return res.status(400).json({
          status: "error",
          message: "Chỉ có hợp đồng chờ phê duyệt mới được từ chối",
        });
      }

      contract.status = "rejected";
      contract.rejectedBy = req.user._id;
      contract.rejectedAt = new Date();

      contract.history.push({
        action: "rejected",
        performedBy: req.user._id,
        comment: req.body.comment || "Hợp đồng đã bị từ chối.",
      });

      // 🔗 LƯU LÊN BLOCKCHAIN
      if (blockchainService.isEnabled()) {
        try {
          const rejectorName =
            req.user.fullName || req.user.username || "Unknown";
          const reason = req.body.comment || "Hợp đồng đã bị từ chối";

          // Kiểm tra contract có tồn tại trên blockchain không
          const exists = await blockchainService.doesContractExist(
            contract.contractNumber
          );

          if (!exists) {
            console.log(
              `⚠️ Contract ${contract.contractNumber} chưa có trên blockchain, đang tạo...`
            );

            // Tạo contract trên blockchain trước
            const createResult = await blockchainService.createContract({
              contractNumber: contract.contractNumber,
              contractName: contract.contractName,
              contractor: contract.contractor,
              contractValue: contract.contractValue,
              currency: contract.currency,
              startDate: contract.startDate,
              endDate: contract.endDate,
              contractType: contract.contractType,
              department: contract.department,
              responsiblePerson: contract.responsiblePerson,
            });

            console.log(
              `✅ Contract created on blockchain: ${createResult.transactionHash}`
            );
            console.log(`⏳ Đợi transaction confirm...`);

            // Đợi transaction confirm
            const provider = blockchainService.provider;
            let confirmed = false;
            let attempts = 0;
            const maxAttempts = 30;

            while (!confirmed && attempts < maxAttempts) {
              try {
                const receipt = await provider.getTransactionReceipt(
                  createResult.transactionHash
                );
                if (receipt && receipt.status === 1) {
                  confirmed = true;
                  console.log(
                    `✅ Transaction confirmed in block ${receipt.blockNumber}`
                  );
                } else if (receipt && receipt.status === 0) {
                  throw new Error("Transaction failed");
                }
              } catch (error) {
                // Transaction chưa được mine
              }

              if (!confirmed) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                attempts++;
              }
            }

            if (!confirmed) {
              throw new Error("Transaction timeout");
            }
          }

          // Từ chối contract trên blockchain
          const txHash = await blockchainService.rejectContract(
            contract.contractNumber,
            rejectorName,
            reason
          );

          if (txHash) {
            contract.blockchainTxHash = txHash;
            console.log(`✅ Rejection saved to blockchain: ${txHash}`);
          }
        } catch (blockchainError) {
          console.error("Blockchain rejection error:", blockchainError);
          // Không fail request nếu blockchain lỗi
          console.log("⚠️ Rejection saved to MongoDB only (blockchain failed)");
        }
      }

      await AuditLog.createLog({
        type: "contract",
        action: "rejected",
        description: `Hợp đồng "${contract.contractName}" đã bị từ chối.`,
        details: req.body.comment || "Không có bình luận",
        performedBy: req.user._id,
        resourceId: contract._id,
        resourceType: "Contract",
      });

      await contract.save();
      await contract.populate("rejectedBy", "username fullName email");

      res.json({
        status: "success",
        message: "Hợp đồng đã được từ chối thành công",
        data: { contract },
      });
    } catch (error) {
      console.error("Lỗi khi từ chối hợp đồng:", error);
      res
        .status(500)
        .json({ status: "error", message: "Không thể từ chối hợp đồng" });
    }
  }
);

// @route   POST /api/contracts/:id/activate
// @desc    Activate contract
// @access  Private (Manager/Admin only)
router.post(
  "/:id/activate",
  authenticateToken,
  requireManager,
  async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);

      if (!contract) {
        return res
          .status(404)
          .json({ status: "error", message: "Không tìm thấy hợp đồng" });
      }
      if (contract.status !== "approved") {
        return res.status(400).json({
          status: "error",
          message: "Chỉ có hợp đồng đã được phê duyệt mới được kích hoạt",
        });
      }

      contract.status = "active";

      contract.history.push({
        action: "activated",
        performedBy: req.user._id,
        comment: req.body.comment || "Hợp đồng đã được kích hoạt.",
      });

      await AuditLog.createLog({
        type: "contract",
        action: "activated",
        description: `Hợp đồng "${contract.contractName}" đã được kích hoạt.`,
        details: req.body.comment || "Không có bình luận",
        performedBy: req.user._id,
        resourceId: contract._id,
        resourceType: "Contract",
      });

      await contract.save();

      res.json({
        status: "success",
        message: "Hợp đồng đã được kích hoạt thành công",
        data: { contract },
      });
    } catch (error) {
      console.error("Lỗi khi kích hoạt hợp đồng:", error);
      res
        .status(500)
        .json({ status: "error", message: "Không thể kích hoạt hợp đồng" });
    }
  }
);

// @route   DELETE /api/contracts/:id
// @desc    Delete contract (soft delete)
// @access  Private (Admin only or contract creator)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy hợp đồng" });
    }

    if (
      contract.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ status: "error", message: "Không được phép xóa hợp đồng này" });
    }

    if (["approved", "active", "completed"].includes(contract.status)) {
      return res.status(400).json({
        status: "error",
        message:
          "Không thể xóa hợp đồng đã được phê duyệt/đang hoạt động/đã hoàn thành",
      });
    }

    contract.status = "deleted";

    contract.history.push({
      action: "deleted",
      performedBy: req.user._id,
      comment: "Hợp đồng đã bị xóa.",
    });

    await AuditLog.createLog({
      type: "contract",
      action: "deleted",
      description: `Hợp đồng "${contract.contractName}" đã bị xóa.`,
      performedBy: req.user._id,
      resourceId: contract._id,
      resourceType: "Contract",
    });

    await contract.save();

    res.json({
      status: "success",
      message: "Hợp đồng đã được xóa thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa hợp đồng:", error);
    res
      .status(500)
      .json({ status: "error", message: "Không thể xóa hợp đồng" });
  }
});

// @route   GET /api/contracts/stats/overview
// @desc    Get contract statistics
// @access  Private
router.get("/stats/overview", authenticateToken, async (req, res) => {
  try {
    const stats = await Contract.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$contractValue" },
        },
      },
    ]);

    const totalContracts = await Contract.countDocuments({
      status: { $ne: "deleted" },
    });
    const totalValue = await Contract.aggregate([
      { $match: { status: { $ne: "deleted" } } },
      { $group: { _id: null, total: { $sum: "$contractValue" } } },
    ]);

    const expiringContracts = await Contract.findExpiring(30);

    res.json({
      status: "success",
      data: {
        totalContracts,
        totalValue: totalValue[0]?.total || 0,
        statusBreakdown: stats,
        expiringContracts: expiringContracts.length,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Không thể tải thống kê hợp đồng",
    });
  }
});

module.exports = router;
