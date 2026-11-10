import { VaultItem, Tag } from '../model/vaultModel.js';
import { uploadFile, getSignedUrl, deleteFile } from '../services/storageService.js';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';

export const createVaultItem = async (req, res) => {
  try {
    const { title, type, description, isFavorite, isInbox, tags, content } = req.body;
    const owner = req.user.id;

    let fileUrl = null;
    let filePath = null;
    let fileName = null;
    let fileSize = null;

    if (req.file) {
      filePath = await uploadFile(req.file, owner);
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = [];
      }
    }

    let parsedContent = null;
    if (content) {
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        parsedContent = content; // fallback
      }
    }

    const newItem = new VaultItem({
      title,
      type,
      description: description || '',
      content: parsedContent,
      filePath,
      fileName,
      fileSize,
      isFavorite: isFavorite === 'true' || isFavorite === true,
      isInbox: isInbox === 'true' || isInbox === true,
      tags: parsedTags,
      owner
    });

    const savedItem = await newItem.save();
    
    // Resolve signed URL if file exists
    await savedItem.populate('tags');
    const itemObj = savedItem.toObject();
    if (itemObj.filePath) {
      itemObj.fileUrl = await getSignedUrl(itemObj.filePath);
    }
    
    res.status(201).json({ success: true, data: itemObj });
  } catch (error) {
    logger.error('Error creating Vault item', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getVaultItems = async (req, res) => {
  try {
    const owner = req.user.id;
    const { type, isFavorite, isInbox, search, tagId } = req.query;

    let query = { owner };

    if (type) query.type = type;
    if (isFavorite === 'true') query.isFavorite = true;
    if (isInbox === 'true') query.isInbox = true;
    if (isInbox === 'false') query.isInbox = false;
    if (tagId) query.tags = tagId;

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { fileName: regex }
      ];
    }

    const items = await VaultItem.find(query)
      .populate('tags')
      .sort({ createdAt: -1 })
      .lean();

    // Generate signed URLs in parallel for items with files
    const itemsWithUrls = await Promise.all(items.map(async (item) => {
      if (item.filePath) {
        const fileUrl = await getSignedUrl(item.filePath);
        return { ...item, fileUrl };
      }
      return item;
    }));

    res.status(200).json({ success: true, data: itemsWithUrls });
  } catch (error) {
    logger.error('Error fetching Vault items', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateVaultItem = async (req, res) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;
    
    // Handle tags and content parsing if they come from formData (strings)
    let updateData = { ...req.body };
    if (updateData.tags && typeof updateData.tags === 'string') {
      try { updateData.tags = JSON.parse(updateData.tags); } catch(e) {}
    }
    if (updateData.content && typeof updateData.content === 'string') {
      try { updateData.content = JSON.parse(updateData.content); } catch(e) {}
    }

    if (updateData.isFavorite === 'true') updateData.isFavorite = true;
    if (updateData.isFavorite === 'false') updateData.isFavorite = false;
    if (updateData.isInbox === 'true') updateData.isInbox = true;
    if (updateData.isInbox === 'false') updateData.isInbox = false;

    const item = await VaultItem.findOneAndUpdate(
      { _id: id, owner },
      updateData,
      { new: true }
    ).populate('tags');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const itemObj = item.toObject();
    if (itemObj.filePath) {
      itemObj.fileUrl = await getSignedUrl(itemObj.filePath);
    }

    res.status(200).json({ success: true, data: itemObj });
  } catch (error) {
    logger.error('Error updating Vault item', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteVaultItem = async (req, res) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;

    const item = await VaultItem.findOneAndDelete({ _id: id, owner }).lean();
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.filePath) {
      deleteFile(item.filePath).catch((err) => {
        logger.warn('Failed to delete file from storage', { filePath: item.filePath, message: err?.message });
      });
    }

    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    logger.error('Error deleting Vault item', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const owner = req.user.id;

    if (!name) return res.status(400).json({ success: false, message: 'Tag name required' });

    let tag = await Tag.findOne({ name, owner }).lean();
    if (!tag) {
      tag = await Tag.create({ name, owner });
      cache.del(`tags:${owner}`);
    }

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    logger.error('Error creating tag', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTags = async (req, res) => {
  try {
    const owner = req.user.id;
    const cacheKey = `tags:${owner}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    const tags = await Tag.find({ owner }).sort({ name: 1 }).lean();
    cache.set(cacheKey, tags, 120);
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    logger.error('Error fetching tags', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;

    await Tag.findOneAndDelete({ _id: id, owner });
    cache.del(`tags:${owner}`);
    
    // Remove this tag from all Vault items
    await VaultItem.updateMany(
      { owner, tags: id },
      { $pull: { tags: id } }
    );

    res.status(200).json({ success: true, message: 'Tag deleted' });
  } catch (error) {
    logger.error('Error deleting tag', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
