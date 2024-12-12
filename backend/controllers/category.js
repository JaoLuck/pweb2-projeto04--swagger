const { Category, Product } = require('../models');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../config/nodemailer');
const authMiddleware = require('../middlewares/auth');


/**
 * Creates a new category
 * @param {*} req
 * @param {*} res
 * @returns Object
 */

/**
   * @swagger
   * /categories:
   *   post:
   *     summary: Cria uma nova categoria
   *     tags: [Categories]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome da categoria
   *     responses:
   *       201:
   *         description: Categoria criada com sucesso
   *       500:
   *         description: Erro no servidor
   */
const createCategory = async (req, res) => {
  try {
    const category = await Category.create({...req.body, id: uuidv4()});

    // Enviar email de notificação para o administrador
    const mailOptions = {
      from: 'paulo.gomes@uncisal.edu.br',
      to: 'paulohenriquegomessilva1@gmail.com',
      subject: 'Nova categoria criada',
      text: `Uma nova categoria foi criada na aula do dia 18/11/2024: ${category.name}`,
      html: `<p>Uma nova categoria foi criada na aula do dia 18/11/2024: ${category.name}</p>`,
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    return res.status(201).json(
      category,
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Fetches all categories
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Busca todas as categorias
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *       500:
 *         description: Erro no servidor
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * Gets a single category by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria retornada com sucesso
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro no servidor
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id: id },
      order: [['createdAt', 'DESC']],
    });

    if (category) {
      return res.status(200).json(category);
    }

    return res
      .status(404)
      .send('Category with the specified ID does not exist');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * Updates a single category by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da categoria
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro no servidor
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Category.update(req.body, { where: { id: id } });

    if (updated) {
      const updatedCategory = await Category.findOne({
        where: { id: id },
        include: [
          {
            model: Product,
          },
        ],
      });
      return res.status(200).json(updatedCategory);
    }

    throw new Error('Category not found ');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * Deletes a single category by it's id
 * @param {*} req
 * @param {*} res
 * @returns Boolean
 */
/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Exclui uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria excluída com sucesso
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro no servidor
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({
      where: {
        id: id,
      },
    });

    if (deleted) {
      return res.status(204).send('Category deleted');
    }

    throw new Error('Category not found ');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  createCategory: [authMiddleware, createCategory],
  getAllCategories: [authMiddleware, getAllCategories],
  getCategoryById: [authMiddleware, getCategoryById],
  updateCategory: [authMiddleware, updateCategory],
  deleteCategory:[authMiddleware, deleteCategory],
};