import mongoose from "mongoose";

const Schema = mongoose.Schema;

var ItemSchema = new Schema({
    name: String,
    desc: [String],
    short_desc: String,
    price: [Number],
    id: Number
});

var OrderSchema = new Schema({
    id: Number,
    person: {type: Schema.Types.ObjectId, ref:'Person'},
    items: [{type: Schema.Types.ObjectId, ref:'Item'}],
    total_amount: Number,
    regular_total: Number,
    order_date: String,
    payment_date: String
});

var GroupSchema = new Schema({
    name: String,
    id: Number,
    people: [{type: Schema.Types.ObjectId, ref:'Person'}],
    items: [{type: Schema.Types.ObjectId, ref:'Item'}],
    groups:[{type:Schema.Types.ObjectId, ref:'Group'}],
    desc: [String],
    price_mult: Number
})

var PersonSchema = new Schema({
    id: Number,
    firstName: String,
    lastName: String,
    age: Number,
    orders: [{type:Schema.Types.ObjectId, ref:'Order'}],
    groups:[{type:Schema.Types.ObjectId, ref:'Group'}]
})

export function getModels(db) {
    const Item = db.model("Item", ItemSchema);
    const Order = db.model("Order", OrderSchema);
    const Group = db.model("Group", GroupSchema);
    const Person = db.model("Person", PersonSchema);

    return {
        Item,
        Order,
        Group,
        Person
    };
}
