const Joi = require('joi');

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('tenant', 'owner', 'admin').optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  property: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .valid('Apartment', 'House', 'Studio', 'Shared Room', 'Condo', 'Townhouse')
      .required(),
    images: Joi.array().items(Joi.string()).min(1).required(),
    location: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('US'),
    }).required(),
    pricing: Joi.object({
      monthlyRent: Joi.number().positive().required(),
      securityDeposit: Joi.number().positive().required(),
      minimumTenure: Joi.number().default(1),
      maximumTenure: Joi.number().optional(),
    }).required(),
    amenities: Joi.array().items(Joi.string()).optional(),
    specifications: Joi.object({
      bedrooms: Joi.number().integer().required(),
      bathrooms: Joi.number().integer().required(),
      squareFeet: Joi.number().optional(),
    }).required(),
  }),

  booking: Joi.object({
    property: Joi.string().required(),
    checkInDate: Joi.date().required(),
    checkOutDate: Joi.date().min(Joi.ref('checkInDate')).required(),
    requestMessage: Joi.string().optional(),
  }),

  review: Joi.object({
    property: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().required(),
    comment: Joi.string().required(),
    categories: Joi.object({
      cleanliness: Joi.number().optional(),
      communication: Joi.number().optional(),
      checkInProcess: Joi.number().optional(),
      accuracy: Joi.number().optional(),
      location: Joi.number().optional(),
      value: Joi.number().optional(),
    }).optional(),
  }),
};

const validate = (schema) => (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return res.status(400).json({
        success: false,
        message,
        errors: error.details,
      });
    }

    req.validatedData = value;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Validation middleware error: ' + err.message,
    });
  }
};

module.exports = { schemas, validate };
