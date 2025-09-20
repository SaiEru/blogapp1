import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { createPost, getPosts, getPostById, updatePost, deletePost, toggleLike, toggleBookmark, addComment, updateComment, deleteComment, reactToPost, getReactions, repost } from '../controllers/postController.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);

router.post('/', requireAuth, [
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
], createPost);

router.put('/:id', requireAuth, [
  body('title').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty(),
], updatePost);

router.delete('/:id', requireAuth, deletePost);

router.post('/:id/like', requireAuth, toggleLike);
router.post('/:id/bookmark', requireAuth, toggleBookmark);
router.post('/:id/comments', requireAuth, [body('text').trim().notEmpty()], addComment);
router.put('/:postId/comments/:commentId', requireAuth, [body('text').trim().notEmpty()], updateComment);
router.delete('/:postId/comments/:commentId', requireAuth, deleteComment);
router.post('/:id/react', requireAuth, [body('emoji').trim().notEmpty()], reactToPost);
router.get('/:id/reactions', getReactions);
router.post('/:id/repost', requireAuth, repost);

export default router;
