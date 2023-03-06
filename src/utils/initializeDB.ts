import Category from '../schemas/Category';
import User from '../schemas/User'
import UserDetails from '../schemas/UserDetails';
const bcrypt = require('bcrypt');

async function initDB() {
    let users = await User.findOne({});
    if (users) return 

    createAdmin();
    createCategories();

}

async function createAdmin() {
    const userDetails = new UserDetails({idNumber: '111111111', email: 'admin@example.com', firstName: 'John', lastName: 'Doe', isAdmin: true, address: {street: 'John Street', city: 'John City'}});

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

export default initDB;