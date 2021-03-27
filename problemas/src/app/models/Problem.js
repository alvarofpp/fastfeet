import Sequelize, { Model } from 'sequelize';

class Problem extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        delivery_id: Sequelize.INTEGER
      },
      { sequelize, tableName: 'delivery_problems' }
    );

    return this;
  }

  static associate(models) {
  }
}

export default Problem;
