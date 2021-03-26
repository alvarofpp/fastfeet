import Problem from '../models/Problem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import entregasService from '../services/entregasService';

class ProblemController {
  async index(req, res) {
    const { page = 1, limit = 5 } = req.query;

    const total = await Problem.count();

    let problems = await Problem.findAll({
      attributes: ['id', 'description'],
      order: [['id', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });
    
    // ids unicos de delivery
    const deliverys_id = [...problems.reduce((current, item) => current.add(item.delivery_id) , new Set())]

    let { items: deliverys }  = (await entregasService.request(req.auth).get('/delivery', {
      params: { deliverys_id: JSON.stringify(deliverys_id) }
    })).data

    deliverys = deliverys.reduce((current, item) => {
      current[item.id] = item
      return current 
    }, {})

    problems = problems.map((problem) => {
      problem.delivery = deliverys[problem.delivery_id]
      return problem
    })

    return res.json({
      limit,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
      items: problems,
    });
  }

  async store(req, res) {
    const { delivery_id } = req.params;
    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery doest not exists' });
    }

    const { id, description } = await Problem.create({
      delivery_id,
      ...req.body,
    });

    return res.json({ id, description });
  }

  async show(req, res) {
    const { delivery_id } = req.params;
    const problems = await Problem.findAll({
      attributes: ['id', 'description'],
      where: { delivery_id },
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product', 'start_date', 'end_date'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'street',
                'number',
                'complement',
                'state',
                'city',
                'zip_code',
              ],
            },
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['name', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(problems);
  }

  async delete(req, res) {
    const { id } = req.params;
    const problem = await Problem.findByPk(id);

    if (!problem)
      return res.status(400).json({ error: "Delivery's problem not found" });

    const delivery = await Delivery.findByPk(problem.delivery_id, {
      include: [
        { model: Deliveryman, as: 'deliveryman' },
        { model: Recipient, as: 'recipient' },
      ],
    });

    if (!delivery) {
      return res.status(500).json({
        error: 'The delivery that reference this problem has been not found',
      });
    }

    const { canceled_at } = await delivery.update({
      canceled_at: new Date(),
    });

    delivery.canceled_at = canceled_at;

    await Queue.add(CancellationMail.key, {
      delivery,
      problem,
    });

    return res.json();
  }
}

export default new ProblemController();
