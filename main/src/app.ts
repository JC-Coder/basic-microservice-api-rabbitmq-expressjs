import * as express from 'express';
import * as cors from 'cors';
import { createConnection } from 'typeorm';
import * as amqp from 'amqplib/callback_api';
import { Product } from './entity/product';
import { Request, Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config()

createConnection().then((db) => {
  const productRepository = db.getMongoRepository(Product);

  amqp.connect(
    process.env.AMQP_URL,
    (error0, connection) => {
      if (error0) {
        throw error0;
      }

      connection.createChannel((error1, channel) => {
        if (error1) {
          throw error1;
        }

        channel.assertQueue('product_created');
        channel.assertQueue('product_updated');
        channel.assertQueue('product_deleted');

        const app = express();

        app.use(
          cors({
            origin: '*'
          })
        );

        app.use(express.json());

        channel.consume(
          'product_created',
          async (msg) => {
            const eventProduct: Product = JSON.parse(msg.content.toString());

            const product = new Product();
            product.admin_id = eventProduct.id;
            product.title = eventProduct.title;
            product.image = eventProduct.image;
            product.likes = eventProduct.likes;

            await productRepository.save(product);
            console.log('product created');
          },
          { noAck: true }
        );

        channel.consume(
          'product_updated',
          async (msg) => {
            const eventProduct: Product = JSON.parse(msg.content.toString());

            const product = await productRepository.findOne({
              where: { admin_id: eventProduct.id }
            });

            await productRepository.update(product.id, {
              title: eventProduct.title,
              image: eventProduct.image,
              likes: eventProduct.likes
            });
            console.log('product updated');
          },
          { noAck: true }
        );

        channel.consume(
          'product_deleted',
          async (msg) => {
            const eventProductId = JSON.parse(msg.content.toString());

            await productRepository.deleteOne({
              admin_id: Number(eventProductId)
            });

            console.log('product deleted');
          },
          { noAck: true }
        );

        app.get('/api/products', async (req: Request, res: Response) => {
          const products = await productRepository.find();
          return res.send(products);
        });

        app.post(
          '/api/products/:id/like',
          async (req: Request, res: Response) => {
            const id = req.params.id;

            const product = await productRepository.findOneBy(id);

            await axios.post(
              `http://localhost:8000/api/products/${product.admin_id}/like`,
              {}
            );

            product.likes += 1;
            const result = await productRepository.save(product);
            return res.send(result);
          }
        );

        console.log('Listening to port: 8001');
        app.listen(8001);

        process.on('beforeExit', () => {
          console.log('closing ....');
          connection.close();
        });
      });
    }
  );
});
