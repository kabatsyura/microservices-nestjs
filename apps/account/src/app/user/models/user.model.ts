import { Document } from 'mongoose';
import { IUser } from '@purple/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from 'interfaces/src/lib/user.module';

@Schema()
export class User extends Document<string> implements IUser {
  @Prop()
  displayName?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    enum: UserRole,
    type: String,
    default: UserRole.Student,
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
