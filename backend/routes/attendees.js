import express from "express"
const router = express.Router();
import Attendee from '../models/Attendee.js'

// GET /attendees?search=prefix
router.get('/', async (req, res) => {
  const search = req.query["search"];
  if (!search) return res.json([]);
  try {
    const regex = new RegExp('^' + search, 'i');
    console.log(regex)
    const attendees = await Attendee.find({name: {$regex: regex}}).limit(10);
    console.log(attendees)
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /attendees/:id
router.get('/:id', async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) return res.status(404).json({ error: 'Not found' });
    res.json(attendee);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 