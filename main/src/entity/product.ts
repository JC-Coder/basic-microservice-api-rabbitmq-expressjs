import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Product {
  @ObjectIdColumn()
  id: string;

  @Column({ unique: true, type: String })
  admin_id: string;

  @Column({ type: String })
  title: string;

  @Column({ type: String })
  image: string;

  @Column({ default: 0, type: Number })
  likes: number;
}
