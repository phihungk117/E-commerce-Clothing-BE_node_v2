const reviewService = require('../../services/review.service');

class AdminReviewController {
    async getAll(req, res, next) {
        try {
            const query = req.query;
            
            const result = await reviewService.getAllReviewsForAdmin(query);

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách đánh giá thành công',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const adminId = req.user.user_id; // For auditing if needed
            const { reviewId } = req.params;
            const { status } = req.body;

            const review = await reviewService.updateReviewStatus(adminId, reviewId, status);

            return res.status(200).json({
                success: true,
                message: `Cập nhật trạng thái đánh giá thành công (${status}).`,
                data: review
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminReviewController();
