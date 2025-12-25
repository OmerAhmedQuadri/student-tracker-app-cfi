import {Schema, Types, model} from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin' | 'mentor';
    
    batchId?: Types.ObjectId;

    gitHubUserName?: string;
    linkedInUserName?: string;
    mediumProfileUrl?: string;

} 

const userSchema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ['user', 'admin', 'mentor'], default: 'user'},

    batchId: {type: Schema.Types.ObjectId, ref: 'Batch'},

    gitHubUserName: {type: String},
    linkedInUserName: {type: String},
    mediumProfileUrl: {type: String},
}, {
    timestamps: true,
});

userSchema.index({role: 1, email: 1, name: 1});

const User = model<IUser>('User', userSchema);

export default User;