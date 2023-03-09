import Cart from '../schemas/Cart';
import Category from '../schemas/Category';
import Item from '../schemas/Item';
import User from '../schemas/User'
import UserDetails from '../schemas/UserDetails';
const bcrypt = require('bcrypt');

async function initDB() {
    let users = await User.findOne({});
    if (users) return 

    await createAdmin();
    await createCategories();
    createItems();
}

async function createAdmin() {
    const newCart = new Cart({cartItems: []});

    try {
        await newCart.save();
    } catch (error) {
        console.log("Cannot create Admin Cart")
    }

    const userDetails = new UserDetails({idNumber: '111111111', email: 'admin@example.com', firstName: 'John', lastName: 'Doe', isAdmin: true, address: {street: 'John Street', city: 'John City'}, cart: newCart});

    const hashedPassword = await bcrypt.hash('password', 10)
    const admin = new User({username: 'admin', password: hashedPassword, userDetails})
    
    userDetails.save();
    admin.save();
}

async function createCategories() {
    const categories = [
        {
            name: 'Diary',
        },
        {
        name: 'Vegetables & Fruits',
        },
        {
        name: 'Meat & Fish',
        },
        {
        name: 'Wine & Alcohol',
        },
        {
        name: 'Snacks',
        },
        {
        name: 'Cleaning',
        },
        {
        name: 'Drinks',
        },
    ]


    try {
        await Category.insertMany(categories)
    } catch (error) {
        console.log("Cannot create categories")
    }
}

async function createItems() {

    let diary;
    let vegetables;
    try {
        diary = await Category.findOne({name: {$regex: "Dia", $options: 'i'}})
        console.log(diary)
        vegetables = await Category.findOne({
            name: {$regex: "Vegetables & Fruits", $options: 'i'},
            });
    } catch (error) {
        console.log("cannot get diary")
    }


    const items = [
        {
            "size": "1L",
            "price": 6,
            "imgUrl": "https://www.tnuva.co.il/uploads/f_606ee43fa87cf_1617880127.jpg",
            "manufacturer": "Tnuva",
            "title": "Milk By Tnuva",
            "category": diary?._id,
        },
        {
            "size": "2L",
            "price": 12,
            "imgUrl": "https://www.rami-levy.co.il/_ipx/w_366,f_webp/https://img.rami-levy.co.il/product/7290010945306/small.jpg",
            "manufacturer": "Tara",
            "title": "Milk By Tara",
            "category": diary?._id,
        },
        {
            "size": "1L",
            "price": 6,
            "imgUrl": "https://d3m9l0v76dty0.cloudfront.net/system/photos/10741829/original/05bc1781b848e90286be2f598f119dc7.jpg",
            "manufacturer": "Yotvata",
            "title": "Milk By Yotvata",
            "category": diary?._id,
        },
        {
            "size": "medium",
            "price": 3,
            "imgUrl": "https://i5.walmartimages.com/asr/9f8b7456-81d0-4dc2-b422-97cf63077762.0ddba51bbf14a5029ce82f5fce878dee.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
            "manufacturer": "Garden",
            "title":"tomato",
            "category": vegetables?._id,
        }
    ]

    try {
        await Item.insertMany(items)
    } catch (error) {
        console.log(error)
    }
}

export default initDB;