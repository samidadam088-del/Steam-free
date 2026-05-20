const express = require('express');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

const router = express.Router();

// Get All Accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find({ verified: true })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الحسابات' });
  }
});

// Get Single Account
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate('uploadedBy', 'username')
      .populate('comments');
    
    if (!account) return res.status(404).json({ message: 'الحساب غير موجود' });
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الحساب' });
  }
});

// Create Account (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { username, email, password, games, description } = req.body;

    const account = new Account({
      username,
      email,
      password,
      games,
      description,
      uploadedBy: req.userId
    });

    await account.save();
    res.status(201).json({ message: 'تم إضافة الحساب بنجاح', account });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إضافة الحساب', error: error.message });
  }
});

// Update Account
router.put('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    
    if (!account) return res.status(404).json({ message: 'الحساب غير موجود' });
    if (account.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'لا تملك صلاحية التعديل' });
    }

    Object.assign(account, req.body);
    await account.save();
    res.json({ message: 'تم تحديث الحساب بنجاح', account });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في التحديث' });
  }
});

// Delete Account
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    
    if (!account) return res.status(404).json({ message: 'الحساب غير موجود' });
    if (account.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'لا تملك صلاحية الحذف' });
    }

    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الحساب بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الحذف' });
  }
});

// Search Accounts
router.get('/search/:keyword', async (req, res) => {
  try {
    const accounts = await Account.find({
      $or: [
        { username: { $regex: req.params.keyword, $options: 'i' } },
        { description: { $regex: req.params.keyword, $options: 'i' } }
      ],
      verified: true
    }).populate('uploadedBy', 'username');

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في البحث' });
  }
});

module.exports = router;
