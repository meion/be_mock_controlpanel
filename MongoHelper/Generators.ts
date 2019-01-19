import { Item, Group, Person, Order } from './Models';


const ORDER_MAX = 10;
const SHORT_DESC_LENGTH = 20;
var faker = require('faker');
var dayjs = require('dayjs');


// ORDER
export async function generateOrders(people, items, groups) {
    let orders : OrderFakeClass[] = [];
    people.forEach(person =>{
        for(let i = 0; i < Math.floor(Math.random() * 5); i++){
            let orderFake = new OrderFakeClass(person._id, items, groups);
            let order = new Order({
                ...orderFake
            });
            orders.push(order);
            // person.orders.push(order);
        }
    });
    return await Order.insertMany(orders);
}

// PERSON
export async function generatePeople(amount: number) {
    let items: any[] = [];
    for(let i = 0; i < amount; i++){
        items.push(
            generatePerson()
        )
    }
    return await Person.insertMany(items);
}
export function generatePerson() {
    let item: any = {
        id: faker.random.number(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        age: Math.floor(Math.random() * 100) + 1,
        // orders: [...Array(10).keys()].map(v => (Math.floor((1 + v) * Math.random()* faker.random.number()))),
        // groups: [...Array(3).keys()].map(v => (Math.floor(v * Math.random()))  + 1)
    };
    return item;
}

//ITEM

export function generateItem() {
    let descs: string[] = [...Array(Math.floor(5 * Math.random()) + 1)].map(() => faker.lorem.sentences());
    let item: any = {
        name: faker.random.word(),
        id: faker.random.number(),
        price: [...Array(10).keys()].map(v => (v + 1)*Math.floor(Math.random() * faker.random.number() + 1)),
        short_desc: getShortDesc(descs[0]),
        desc: descs

    };
    return item;
}

export async function generateItems(amount) {
    let items: any[] = [];
    for(let i = 0; i < amount; i++){
        items.push(
            generateItem()
        )
    }
    return await Item.insertMany(items);
}

//GROUP
export async function generateGroups(amount: number, ITEM_PERCENTAGE: number, PERSON_PERCENTAGE: number, items, people) {
    let groups: any[] = [];
    for(let i = 0; i < amount; i++){
        groups.push(
            generateGroup(ITEM_PERCENTAGE, PERSON_PERCENTAGE, items, people)
        )
    }
    return await Group.insertMany(groups);
}

export function generateGroup(ITEM_PERCENTAGE, PERSON_PERCENTAGE, items, people) {
    let descs: string[] = [...Array(Math.floor(2 * Math.random()) + 1)].map(() => faker.lorem.sentences());
    let item: any = {
        name: faker.random.word(),
        id: faker.random.number(),
        price_mult: (Math.random() % 100) * 0.75,
        desc: descs,
        items: items.map(item =>{
            if(Math.random() <= ITEM_PERCENTAGE){
                return item._id
            }else{
                return -1;
            }
        }).filter(v => v !== -1),

        people: people.map(person => {
            if(Math.random() <= PERSON_PERCENTAGE){
                return person._id
            }else{
                return -1;
            }
        }).filter(v => v !== -1)
    };
    return item;
}

export function getShortDesc(desc: string) {
    return desc.substring(0, SHORT_DESC_LENGTH)
}


class OrderFakeClass {
    id: number;
    person: number;
    items: number[];
    total_amount:number;
    regular_total:number;
    order_date:string;
    payment_date:string;
    constructor(person_id:number, items:any[], groups:any[]){
        this.id = faker.random.number();
        this.person = person_id;
        this.items = items.map(item => item._id);

        let random = Math.random();
        let weekDayMonth = random < 0.25 ? 'day' : random < 0.75 ? 'week' : 'Month';
        let adder = this.getAdder(weekDayMonth);
        this.order_date = dayjs().add(adder, weekDayMonth).format('YYYY-MM-DD');

        random = Math.random();
        weekDayMonth = random < 0.50 ? 'day' : random < 0.90 ? 'week' : 'Month';
        adder = this.getAdder(weekDayMonth);
        this.payment_date = dayjs(this.order_date).add(adder, weekDayMonth).format('YYYY-MM-DD');

        this.calculateTotal(items, person_id, groups.filter(group => group.people.includes(person_id)));

        this.calculateTotal = this.calculateTotal.bind(this);
    }
    getAdder(weekDayMonth:string){
        let adder = 0;
        switch(weekDayMonth){
            case 'day':
            adder = Math.floor(Math.random() * 7) + 1;
            case 'week':
            adder = Math.floor(Math.random() * 52) + 1;
            case 'Month':
            adder = Math.floor(Math.random() * 12) + 1;
        };
        return adder;
    }
    calculateTotal(items: any[], id: number, groups: any[]){
        let total_amount = 0;
        let regular_total = 0;
        let multiplier = 1;
        let current_groups = [];
        let best_group : any;
        items.forEach(item =>{
            current_groups = groups.filter(group => group.items.includes(item.id));
            current_groups.forEach(group => {
                if(!best_group || best_group.price_mult > group.price_mult){
                    best_group = group;
                }
            });
            multiplier = best_group ? best_group.price_mult : 1;
            total_amount += item.price[Math.floor(Math.random() * item.price.length)] * multiplier;
            regular_total += item.price[Math.floor(Math.random() * item.price.length)];
            multiplier = 1;
        });
        this.total_amount = total_amount;
        this.regular_total = regular_total;
    }
}
