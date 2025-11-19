import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation results and return errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration/creation
 */
export const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user', 'verifier']).withMessage('Invalid role'),
  
  body('orgId')
    .optional()
    .isInt({ min: 1 }).withMessage('Organization ID must be a positive integer'),
  
  validate
];

/**
 * Validation rules for user login
 */
export const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

/**
 * Validation rules for organization creation
 */
export const validateOrganizationCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Organization name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Organization name must be 2-255 characters'),
  
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
    .isLength({ min: 2, max: 100 }).withMessage('Slug must be 2-100 characters'),
  
  body('domain')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/).withMessage('Must be a valid domain'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  
  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('contactPhone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/).withMessage('Invalid phone number format'),
  
  validate
];

/**
 * Validation rules for organization update
 */
export const validateOrganizationUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Organization name must be 2-255 characters'),
  
  body('domain')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/).withMessage('Must be a valid domain'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  
  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('contactPhone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/).withMessage('Invalid phone number format'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  validate
];

/**
 * Validation rules for document hash upload
 * 
 * Hash Requirements by Document Type:
 * - Scanned PDFs/Images: imageHash required, textHash optional (if OCR), signature/stamp optional (if ROI)
 * - Native PDFs: textHash + imageHash required, signature/stamp optional (if ROI)
 * - Text Documents: textHash required, imageHash optional
 * - Minimum: At least ONE hash (textHash OR imageHash) must be provided
 */
export const validateDocumentUpload = [
  body('docId')
    .trim()
    .notEmpty().withMessage('Document ID is required')
    .matches(/^[A-Z0-9_-]+$/).withMessage('Document ID must contain only uppercase letters, numbers, underscores, and hyphens')
    .isLength({ min: 5, max: 150 }).withMessage('Document ID must be 5-150 characters'),
  
  body('type')
    .trim()
    .notEmpty().withMessage('Document type is required')
    .isIn(['transcript', 'certificate', 'letter', 'license', 'diploma', 'permit', 'contract', 'invoice', 'other']).withMessage('Invalid document type'),
  
  body('metadata')
    .optional()
    .isObject().withMessage('Metadata must be an object'),
  
  body('hashes')
    .notEmpty().withMessage('Hashes object is required')
    .isObject().withMessage('Hashes must be an object')
    .custom((hashes) => {
      // At least one primary hash (textHash or imageHash) must be provided
      if (!hashes.textHash && !hashes.imageHash) {
        throw new Error('At least one hash (textHash or imageHash) is required');
      }
      return true;
    }),
  
  body('hashes.textHash')
    .optional()
    .trim()
    .custom((value) => !value || /^[a-f0-9]{64}$/.test(value))
    .withMessage('Text hash must be a valid SHA-256 hash (64 hex characters)'),
  
  body('hashes.imageHash')
    .optional()
    .trim()
    .custom((value) => !value || /^[a-f0-9]{64}$/.test(value))
    .withMessage('Image hash must be a valid SHA-256 hash (64 hex characters)'),
  
  body('hashes.signatureHash')
    .optional()
    .trim()
    .custom((value) => !value || /^[a-f0-9]{64}$/.test(value))
    .withMessage('Signature hash must be a valid SHA-256 hash (64 hex characters)'),
  
  body('hashes.stampHash')
    .optional()
    .trim()
    .custom((value) => !value || /^[a-f0-9]{64}$/.test(value))
    .withMessage('Stamp hash must be a valid SHA-256 hash (64 hex characters)'),
  
  validate
];

/**
 * Validation rules for document verification
 */
export const validateDocumentVerification = [
  body('docId')
    .trim()
    .notEmpty().withMessage('Document ID is required')
    .isLength({ min: 5, max: 100 }).withMessage('Document ID must be 5-100 characters'),
  
  body('versionNumber')
    .optional()
    .isInt({ min: 1 }).withMessage('Version number must be a positive integer'),
  
  body('textHash')
    .trim()
    .notEmpty().withMessage('Text hash is required')
    .matches(/^[a-f0-9]{64}$/).withMessage('Text hash must be a valid SHA-256 hash (64 hex characters)'),
  
  body('imageHash')
    .trim()
    .notEmpty().withMessage('Image hash is required')
    .matches(/^[a-f0-9]{64}$/).withMessage('Image hash must be a valid SHA-256 hash (64 hex characters)'),
  
  body('signatureHash')
    .optional()
    .trim()
    .matches(/^[a-f0-9]{64}$/).withMessage('Signature hash must be a valid SHA-256 hash (64 hex characters)'),
  
  body('stampHash')
    .optional()
    .trim()
    .matches(/^[a-f0-9]{64}$/).withMessage('Stamp hash must be a valid SHA-256 hash (64 hex characters)'),
  
  body('merkleRoot')
    .trim()
    .notEmpty().withMessage('Merkle root is required')
    .matches(/^[a-f0-9]{64}$/).withMessage('Merkle root must be a valid SHA-256 hash (64 hex characters)'),
  
  validate
];

/**
 * Validation rules for document workflow update
 */
export const validateWorkflowUpdate = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'approved', 'rejected']).withMessage('Status must be pending, approved, or rejected'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters'),
  
  validate
];

/**
 * Validation rules for QR code generation
 */
export const validateQRGeneration = [
  body('docId')
    .trim()
    .notEmpty().withMessage('Document ID is required')
    .isLength({ min: 5, max: 100 }).withMessage('Document ID must be 5-100 characters'),
  
  body('versionHash')
    .optional()
    .trim()
    .matches(/^[a-f0-9]{64}$/).withMessage('Version hash must be a valid SHA-256 hash (64 hex characters)'),
  
  validate
];

/**
 * Validation rules for pagination parameters
 */
export const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be 0 or greater'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be 1 or greater'),
  
  validate
];

/**
 * Validation rules for ID parameters
 */
export const validateIdParam = (paramName = 'id') => [
  param(paramName)
    .isInt({ min: 1 }).withMessage(`${paramName} must be a positive integer`),
  
  validate
];

/**
 * Validation rules for document ID parameter
 */
export const validateDocIdParam = [
  param('docId')
    .trim()
    .notEmpty().withMessage('Document ID is required')
    .isLength({ min: 5, max: 100 }).withMessage('Document ID must be 5-100 characters'),
  
  validate
];

/**
 * Sanitize and validate search query
 */
export const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Search query must be 1-200 characters')
    .customSanitizer(value => value.replace(/[<>]/g, '')), // Remove HTML tags
  
  query('filter')
    .optional()
    .isIn(['all', 'pending', 'approved', 'rejected', 'revoked']).withMessage('Invalid filter value'),
  
  validate
];

export default {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateOrganizationCreation,
  validateOrganizationUpdate,
  validateDocumentUpload,
  validateDocumentVerification,
  validateWorkflowUpdate,
  validateQRGeneration,
  validatePagination,
  validateIdParam,
  validateDocIdParam,
  validateSearchQuery
};
