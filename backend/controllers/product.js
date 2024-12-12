const { Product } = require('../models');
const multer = require('multer');
const uploadToCloudinary = require('../middlewares/upload-cloud');
const upload = multer({ storage: multer.memoryStorage() });
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/auth');

/**
 * Creates a new product
 * @param {*} req
 * @param {*} res
 * @returns Object
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do produto
 *               price:
 *                 type: number
 *                 description: Preço do produto
 *               productImage:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do produto
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro no servidor
 */
const createProduct = [
  // Upload de arquivo em disco
  upload.single('productImage'),

  // Upload de arquivo em nuvem
  uploadToCloudinary,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('price').isNumeric().withMessage('O preço deve ser numérico'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Transformação dos dados
    const transformedData = {
      ...req.body,
      id: uuidv4(),
      name: req.body.name.toLowerCase(),
      // productImage: req.file ? req.file.filename : null, // Upload de arquivo em disco
      productImage: req.cloudinaryUrl || null, // Upload de arquivo em nuvem
      expiryDate: new Date()
    };

    try {
      const product = await Product.create(transformedData);
      return res.status(201).json(
        product
      );
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
];


/**
 * Fetches all products
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Busca todos os produtos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *       500:
 *         description: Erro no servidor
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] })

    return res.status(200).json( products )
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

/**
 * Gets a single product by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto retornado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro no servidor
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findOne({
      where: { id: id }
    })

    if (product) {
      return res.status(200).json( product )
    }

    return res.status(404).send('Product with the specified ID does not exist')
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
/**
 * Updates a single product by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto pelo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do produto
 *               price:
 *                 type: number
 *                 description: Preço do produto
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro no servidor
 */
const updateProductById = [
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('price').optional().isNumeric().withMessage('O preço deve ser numérico'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      let product = await Product.findOne({ where: { id: id } });

      if (!product) {
        return res.status(404).send('Product not found');
      }

      // Transformação de dados antes de atualizar
      const updatedData = req.body;
      if (updatedData.name) {
        updatedData.name = updatedData.name.toLowerCase(); // Converter nome para minúsculo
      }

      await product.update(updatedData);
      return res.status(200).json( product );
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
];


/**
 * Deletes a single product by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Exclui um produto pelo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro no servidor
 */
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params

    const deletedProduct = await Product.destroy({
      where: { id: id }
    })

    if (deletedProduct) {
      return res.status(204).send('Product deleted successfully ')
    }

    throw new Error('Product not found')
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

module.exports = {
  createProduct: [authMiddleware, createProduct],
  getAllProducts: [authMiddleware, getAllProducts],
  getProductById: [authMiddleware, getProductById],
  deleteProductById: [authMiddleware, deleteProductById],
  updateProductById: [authMiddleware, updateProductById]
}