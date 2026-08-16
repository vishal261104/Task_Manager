import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/auth.js';
import {
  createVaultItem,
  getVaultItems,
  updateVaultItem,
  deleteVaultItem,
  createTag,
  getTags,
  deleteTag
} from '../controller/vaultController.js';

const vaultRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

vaultRouter.use(authMiddleware);

// Tags — MUST come before /:id to avoid 'tags' being matched as an ID
vaultRouter.route('/tags')
  .get(getTags)
  .post(createTag);

vaultRouter.route('/tags/:id')
  .delete(deleteTag);

// Vault Items
vaultRouter.route('/')
  .get(getVaultItems)
  .post(upload.single('file'), createVaultItem);

vaultRouter.route('/:id')
  .put(upload.single('file'), updateVaultItem)
  .delete(deleteVaultItem);

export default vaultRouter;
