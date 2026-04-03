const reviewService = require('../services/review.service');

class ReviewController {
    async create(req, res, next) {
        try {
            const userId = req.user.user_id; // Assume auth middleware sets req.user
            const { productId } = req.params;
            const data = req.body;

            const review = await reviewService.createReview(userId, productId, data);

            return res.status(201).json({
                success: true,
                message: 'Đánh giá sản phẩm thành công. Đang chờ quản trị viên phê duyệt.',
                data: review
            });
        } catch (error) {
            next(error);
        }
    }

    async getByProduct(req, res, next) {
        try {
            const { productId } = req.params;
            const query = req.query;

            const result = await reviewService.getReviewsByProduct(productId, query);

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách đánh giá thành công',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const userId = req.user.user_id;
            const { reviewId } = req.params;
            const data = req.body;

            const review = await reviewService.updateReviewByUser(userId, reviewId, data);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật đánh giá thành công. Trạng thái đã chuyển về PENDING.',
                data: review
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const userId = req.user.user_id;
            const { reviewId } = req.params;

            const result = await reviewService.deleteReviewByUser(userId, reviewId);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReviewController();
