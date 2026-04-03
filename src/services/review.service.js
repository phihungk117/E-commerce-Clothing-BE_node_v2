const { Review, Product, User } = require('../models');
const { Op } = require('sequelize');

class ReviewService {
    async createReview(userId, productId, data) {
        try {
            const { rating, title, content, images } = data;
            
            // Sequelize unique constraint on (user_id, product_id) will throw an error
            // if a user tries to review the same product twice. We can rely on it
            // or perform a pre-check to give a clearer error message.
            const existingReview = await Review.findOne({
                where: { user_id: userId, product_id: productId }
            });

            if (existingReview) {
                const error = new Error('Bạn đã đánh giá sản phẩm này rồi.');
                error.status = 400; // Bad Request
                throw error;
            }

            const review = await Review.create({
                user_id: userId,
                product_id: productId,
                rating,
                title,
                content,
                images: images || [], // images could be array of strings
                status: 'PENDING'
            });

            return review;
        } catch (error) {
            throw error;
        }
    }

    async getReviewsByProduct(productId, query) {
        try {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const offset = (page - 1) * limit;

            const { rows, count } = await Review.findAndCountAll({
                where: {
                    product_id: productId,
                    status: 'APPROVED'
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['user_id', 'first_name', 'last_name', 'avatar_url']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            // Tính toán Average Rating
            const allApprovedReviews = await Review.findAll({
                where: { product_id: productId, status: 'APPROVED' },
                attributes: ['rating']
            });

            const totalReviews = allApprovedReviews.length;
            const averageRating = totalReviews > 0 
                ? (allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
                : 0;

            return {
                reviews: rows,
                pagination: {
                    total_items: count,
                    total_pages: Math.ceil(count / limit),
                    current_page: page,
                    limit
                },
                summary: {
                    total_reviews: totalReviews,
                    average_rating: parseFloat(averageRating)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async updateReviewByUser(userId, reviewId, data) {
        try {
            const review = await Review.findOne({
                where: { review_id: reviewId, user_id: userId }
            });

            if (!review) {
                const error = new Error('Không tìm thấy đánh giá hoặc bạn không có quyền sửa.');
                error.status = 404;
                throw error;
            }

            const { rating, title, content, images } = data;

            // Đặt lại status là PENDING nếu user tự chỉnh sửa
            await review.update({
                rating: rating || review.rating,
                title: title !== undefined ? title : review.title,
                content: content || review.content,
                images: images || review.images,
                status: 'PENDING' 
            });

            return review;
        } catch (error) {
            throw error;
        }
    }

    async deleteReviewByUser(userId, reviewId) {
        try {
            const review = await Review.findOne({
                where: { review_id: reviewId, user_id: userId }
            });

            if (!review) {
                const error = new Error('Không tìm thấy đánh giá hoặc bạn không có quyền xóa.');
                error.status = 404;
                throw error;
            }

            await review.destroy();

            return { message: 'Xóa đánh giá thành công.' };
        } catch (error) {
            throw error;
        }
    }

    async getAllReviewsForAdmin(query) {
        try {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const offset = (page - 1) * limit;

            const whereClause = {};
            
            if (query.status) {
                whereClause.status = query.status;
            }
            if (query.product_id) {
                whereClause.product_id = query.product_id;
            }
            if (query.user_id) {
                whereClause.user_id = query.user_id;
            }

            const { rows, count } = await Review.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['user_id', 'email', 'first_name', 'last_name']
                    },
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['product_id', 'name']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            return {
                reviews: rows,
                pagination: {
                    total_items: count,
                    total_pages: Math.ceil(count / limit),
                    current_page: page,
                    limit
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async updateReviewStatus(adminId, reviewId, status) {
        try {
            if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
                const error = new Error('Trạng thái không hợp lệ.');
                error.status = 400;
                throw error;
            }

            const review = await Review.findByPk(reviewId);

            if (!review) {
                const error = new Error('Không tìm thấy đánh giá.');
                error.status = 404;
                throw error;
            }

            await review.update({ status: status });

            return review;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ReviewService();
