import { Rating } from '../models/Rating.js';
import Joi from 'joi';

const createSchema = Joi.object({
  movieCode: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  note: Joi.string().optional(),
  ratedBy: Joi.string().length(24).hex().optional()
});
// GET /api/ratings
// TODO: implement per README.md section 2.
export async function getAllRatings(req, res, next) {
  try {
        const ratings = await Rating.find().sort({ createdAt: -1 }).lean();
    res.json({ ratings });
  } catch (err) { next(err); }
}

// GET /api/ratings/:id
// TODO: implement per README.md section 2.
export async function getRating(req, res, next) {
  try {
        const rating = await Rating.findById(req.params.id).lean();
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    res.json({ rating });
  } catch (err) { next(err); }
}

// POST /api/ratings
// TODO: implement per README.md section 2.
export async function createRating(req, res, next) {
  try {
        const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const rating = await Rating.create(value);
    res.status(201).json({ rating });
  } catch (err) { next(err); }
}

// GET /api/ratings/summary?movieCode=MV101
// TODO: implement per README.md section 3.
export async function getRatingSummary(req, res, next) {
  try {
        const { movieCode } = req.query;

    if (!movieCode) {
      return res.status(400).json({ message: 'movieCode is required' });
    }

    const [summary] = await Rating.aggregate([
      { $match: { movieCode: String(movieCode) } },
      {
        $group: {
          _id: '$movieCode',
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 }
        }
      }
    ]);

    if (!summary) {
      return res.json({ movieCode: String(movieCode), averageRating: 0, ratingCount: 0 });
    }

    return res.json({
      movieCode: String(movieCode),
      averageRating: summary.averageRating,
      ratingCount: summary.ratingCount
    });
  } catch (err) { next(err); }
}
