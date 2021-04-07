import { Op } from 'sequelize';
import Problem from '../models/Problem';
import entregasService from '../services/entregasService';

class ProblemController {
  async index(req, res) {
    const { page = 1, limit = 5, id_in, delivery_id_in} = req.query

    let { fk_exclude } = req.query
    fk_exclude = fk_exclude ? JSON.parse(fk_exclude) : []
    
    const where = {};

    if (id_in) {
      where.id = { [Op.in]: JSON.parse(id_in) };
    }

    if (delivery_id_in) {
      where.delivery_id = { [Op.in]: JSON.parse(delivery_id_in) };
    }

    const total = await Problem.count({ where });

    let problems = await Problem.findAll({
      where,
      attributes: ['id', 'description', 'delivery_id', 'createdAt'],
      order: [['id', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    if (!fk_exclude.includes('delivery')) {
      // ids unicos de delivery
      const delivery_in = [
        ...problems.reduce(
          (current, item) => current.add(item.delivery_id),
          new Set()
        ),
      ];

      let { items: deliverys } = (
        await entregasService.request(req.auth).get('/delivery', {
          params: {
            id_in: JSON.stringify(delivery_in),
            fk_exclude: JSON.stringify(['problems'])
          },
        })
      ).data;

      deliverys = deliverys.reduce((current, item) => {
        current[item.id] = item;
        return current;
      }, {});

      problems = problems.map(problem => {
        problem.dataValues.delivery = deliverys[problem.delivery_id];
        return problem;
      });

      problems = problems.filter(problem => problem.dataValues.delivery);
    }

    return res.json({
      limit,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
      items: problems,
    });
  }

  async store(req, res) {
    const { delivery_id } = req.body;

    const delivery = (
      await entregasService.request(req.auth).get(`/delivery/${delivery_id}`)
    ).data;

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery doest not exists' });
    }

    const { id, description } = await Problem.create({
      delivery_id,
      ...req.body,
    });

    return res.json({ id, description });
  }
}

export default new ProblemController();
