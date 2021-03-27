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
      attributes: ['id', 'description', 'delivery_id'],
      order: [['id', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });
    
    // ids unicos de delivery
    const deliverys_id = [
      ...problems.reduce((current, item) => current.add(item.delivery_id) , new Set())
    ]

    let { items: deliverys }  = (await entregasService.request(req.auth).get('/delivery', {
      params: { deliverys_id: JSON.stringify(deliverys_id) }
    })).data

    deliverys = deliverys.reduce((current, item) => {
      current[item.id] = item
      return current
    }, {})

    problems = problems.map((problem) => {
      problem.dataValues.delivery = deliverys[problem.delivery_id]
      return problem
    })

    problems = problems.filter((problem) => problem.dataValues.delivery )

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
    
    const delivery  = (await entregasService.request(req.auth).get(`/delivery/${delivery_id}`)).data

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery doest not exists' });
    }

    const { id, description } = await Problem.create({
      delivery_id,
      ...req.body,
    });

    return res.json({ id, description });
  }

//  async show(req, res) {
//    const { delivery_id } = req.params;
//    const problems = await Problem.findAll({
//      attributes: ['id', 'description'],
//      where: { delivery_id },
//      include: [
//        {
//          model: Delivery,
//          as: 'delivery',
//          attributes: ['id', 'product', 'start_date', 'end_date'],
//          include: [
//            {
//              model: Recipient,
//              as: 'recipient',
//              attributes: [
//                'id',
//                'name',
//                'street',
//                'number',
//                'complement',
//                'state',
//                'city',
//                'zip_code',
//              ],
//            },
//            {
//              model: Deliveryman,
//              as: 'deliveryman',
//              attributes: ['id', 'name', 'email'],
//              include: [
//                {
//                  model: File,
//                  as: 'avatar',
//                  attributes: ['name', 'path', 'url'],
//                },
//              ],
//            },
//            {
//              model: File,
//              as: 'signature',
//              attributes: ['name', 'path', 'url'],
//            },
//          ],
//        },
//      ],
//    });
//
//    return res.json(problems);
//  }

}

export default new ProblemController();
