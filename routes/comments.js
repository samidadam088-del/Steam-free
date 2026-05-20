const express = require('express');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get Comments for Account
router.get('/account/:accountId', async (req, res) => {
  try {
    const comments = await Comment.find({ account: req.params.accountId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب التعليقات' });
  }
});

// Add Comment
router.post('/', auth, async (req, res) => {
  try {
    const { text, rating, account } = req.body;

    const comment = new Comment({
      text,
      rating,
      account,
      user: req.userId
    });

    await comment.save();
    await comment.populate('user', 'username avatar');
    res.status(201).json({ message: 'تم إضافة التعليق بنجاح', comment });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إضافة التعليق' });
  }
});

// Delete Comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) return res.status(404).json({ message: 'التعليق غير موجود' });
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'لا تملك صلاحية الحذف' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف التعليق بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف التعليق' });
  }
});

module.exports = router;
