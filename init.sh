#!/bin/bash

# Back-end
docker-compose run fastfeet-backend yarn sequelize db:migrate
docker-compose run fastfeet-backend yarn sequelize db:seed:all
