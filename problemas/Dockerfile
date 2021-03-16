FROM python:3

ENV PYTHONUNBUFFERED=1
ENV DJANGO_DEBUG False
ENV DJANGO_ALLOWED_HOST *
ENV DJANGO_PORT 8000
ENV DATABASE_HOST db
ENV REDIS_HOST redis

RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt
COPY . /code/
