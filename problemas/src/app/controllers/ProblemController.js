import Problem from '../models/Problem';
import entregasService from '../services/entregasService';

class ProblemController {
  async index(req, res) {
    const { page = 1, limit = 5 } = req.query;
    const total = await Problem.count();

    let problems = await Problem.findAll({
      attributes: ['id', 'description', 'delivery_id'],
      order: [['id', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    // ids unicos de delivery
    const deliverys_id = [
      ...problems.reduce(
        (current, item) => current.add(item.delivery_id),
        new Set()
      ),
    ];

    let { items: deliverys } = (
      await entregasService.request(req.auth).get('/delivery', {
        params: { deliveries_id: JSON.stringify(deliverys_id) },
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
