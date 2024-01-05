import * as express from 'express';
import * as cors from 'cors';
import { createConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Product } from './entity/product';
import * as amqp from 'amqplib/callback_api';
import * as dotenv from 'dotenv';
dotenv.config();

createConnection().then((db) => {
  const productRepository = db.getRepository(Product);

  amqp.connect(process.env.AMQP_URL, (error0, connection) => {
    if (error0) {
      throw error0;
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      const app = express();

      app.use(
        cors({
          origin: '*'
        })
      );

      app.use(express.json());

      app.get('/api/products', async (req: Request, res: Response) => {
        const products = await productRepository.find();

        return res.status(200).json(products);
      });

      app.post('/api/products', async (req: Request, res: Response) => {
        const product = productRepository.create(req.body);
        const result = await productRepository.save(product);

        channel.sendToQueue(
          'product_created',
          Buffer.from(JSON.stringify(result))
        );

        return res.status(201).json(result);
      });

      app.get('/api/products/:id', async (req: Request, res: Response) => {
        const id = req.params.id as unknown as number;

        const product = await productRepository.findOneBy({
          id
        });

        return res.status(200).json(product);
      });

      app.put('/api/products/:id', async (req: Request, res: Response) => {
        const id = req.params.id as unknown as number;

        const product = await productRepository.findOneBy({ id });
        productRepository.merge(product, req.body);
        const result = await productRepository.save(product);

        channel.sendToQueue(
          'product_updated',
          Buffer.from(JSON.stringify(result))
        );

        return res.send(result);
      });

      app.delete('/api/products/:id', async (req: Request, res: Response) => {
        const id = req.params.id as unknown as number;
        const result = await productRepository.delete({ id });

        channel.sendToQueue('product_deleted', Buffer.from(JSON.stringify(id)));

        return res.send(result);
      });

      app.post(
        '/api/products/:id/like',
        async (req: Request, res: Response) => {
          const id = req.params.id as unknown as number;
          const product = await productRepository.findOneBy({ id });
          product.likes++;
          const result = await productRepository.save(product);
          return res.send(result);
        }
      );

      console.log('Listening to port: 8000');
      app.listen(8000);
      process.on('beforeExit', () => {
        console.log('closing ....');
        connection.close();
      });
    });
  });
});
