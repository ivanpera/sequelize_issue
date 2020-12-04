import { DataTypes, Model, Sequelize, UUIDV4 } from "sequelize";

//#region DB SETUP

class UserModel extends Model{};

async function initUsersModel(sequelize : Sequelize) {
    UserModel.init({
        id: {
          primaryKey : true,
          type : DataTypes.UUID,
          defaultValue : UUIDV4,
          allowNull : false
        },
        firstName: {
          type : DataTypes.STRING,
        },
        lastName: {
          type : DataTypes.STRING
        },
      }, {
        sequelize,
        modelName : "Users",
        timestamps : false
      });
}

export class AModel extends Model{};

async function initAModel(sequelize : Sequelize) {
    AModel.init({
        id: {
          primaryKey : true,
          type : DataTypes.UUID,
          defaultValue : UUIDV4,
          allowNull : false
        },
        a: {
          type : DataTypes.STRING,
        },
        a2: {
          type : DataTypes.STRING,
        }
      }, {
        sequelize,
        modelName : "Users_As",
        name : {
          plural : "a",
          singular : "a"
        },
        timestamps : false
      });
}

class DModel extends Model{};

async function initDModel(sequelize : Sequelize) {
    DModel.init({
        id: {
          primaryKey : true,
          type : DataTypes.UUID,
          defaultValue : UUIDV4,
          allowNull : false
        },
        d: {
          type : DataTypes.STRING,
        }
      }, {
        sequelize,
        modelName : "As_Ds",
        name : {
          plural : "d",
          singular : "d"
        },
        timestamps : false
      });
}

export class Context {

    public async init(sequelize : Sequelize) : Promise<Sequelize> {
        initUsersModel(sequelize)
        initAModel(sequelize)
        initDModel(sequelize);
        UserModel.hasOne(AModel);
        AModel.hasOne(DModel);

        return await sequelize.sync({force : true})
    }

}
//#endregion


const sequelize : Sequelize = new Sequelize('sqlite::memory');
const context : Context = new Context();

async function testConnection() {
    try {
      await sequelize.authenticate();
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
}

async function populateDB() {
    const user = await UserModel.create({firstName: "FirstName", lastName: "LastName"});
    //@ts-ignore
    const a = await user["createA"]({a : "A", a2 : "A2"});
    //@ts-ignore
    const d = await a["createD"]({d : "D"})
}

async function initModels() {
  await context.init(sequelize);
}

testConnection().then(() => initModels())
                .then(() => populateDB())
                .then(() => testQueries());

async function testQueries() {

  //This request returns an empty record
  let res = await UserModel.findAll({
    //@ts-ignore
    model: UserModel,
    attributes : [],
    //@ts-ignore
    include: [{
      model : AModel,
      attributes : [],
      include : [{
        model : DModel,
        //@ts-ignore
        attributes: {all : true}
      }]
    }]
  })

  //This request returns {id : ..., d : {...}}
  /*let res = await UserModel.findAll({
    //@ts-ignore
    model: UserModel,
    attributes : [],
    //@ts-ignore
    include: [{
      model : AModel,
      attributes : ["id"],
      include : [{
        model : DModel,
        //@ts-ignore
        attributes: {all : true}
      }]
    }]
  })
  */

  //@ts-ignore
  console.log(res[0].toJSON())
}