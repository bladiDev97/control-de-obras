const Query = 'query';
const List = 'get';
const Detail = 'get/:id';
const Create = 'create';
const Update = 'update';
const Delete = 'delete/:id';
const Register = 'register';
const Login = 'login';
const Activate = 'activate';
const RequestResetPassword = 'request-reset-password';
const ResetPassword = 'reset-password';
const changePassword = 'change-password';

export const Routes = {
  Obras: {
    ApiTags: `Obras`,
    Controller: `obras`,
    GetAll: '',
    GetOne: ':id',
    Create: 'create',
    Update: 'update',
    Terminar: ':id/terminar',
    Asignar: ':id/asignar',
    Importar: 'importar',
    Bitacoras: ':id/bitacoras',
    Oficio: ':id/oficio',
    AuditConsecutivos: 'consecutivos/audit',
    ResequenceConsecutivos: 'consecutivos/resequence',
  },

  Personal: {
    ApiTags: `Personal`,
    Controller: `personal`,
    GetAll: '',
    GetOne: ':id',
    Create: 'create',
    Update: 'update',
    Delete: 'delete/:id',
  },

  Config: {
    ApiTags: `Config`,
    Controller: `config`,
    GetSmtp: 'smtp',
    SaveSmtp: 'smtp',
    TestSmtp: 'smtp/test',
    TestWhatsapp: 'whatsapp/test',
    TestWhatsappAlert: 'whatsapp/test-alert',
  },

  Areas: {
    ApiTags: `Areas`,
    Controller: `areas`,
    GetAll: '',
    Create: 'create',
  },

  User: {
    ApiTags: `User`,
    Controller: `user`,
    Detail,
    List,
    Create,
    Update,
    Delete,
  },

  PigeonHouse: {
    ApiTags: `PigeonHouse`,
    Controller: `pigeonHouse`,
    Detail,
    List,
    Create,
    Update,
    Delete,
  },

  Address: {
    ApiTags: `Address`,
    Controller: `address`,
    Detail,
    List,
    Create,
    Update,
    Delete,
  },

  UserCredential: {
    ApiTags: `UserCredential`,
    Controller: `userCredential`,
    Detail,
    List,
    Create,
    Update,
    Delete,
  },

  Auth: {
    ApiTags: `Auth`,
    Controller: `auth`,
    Detail,
    List,
    Create,
    Update,
    Delete,
    Register,
    Login,
    Activate,
    RequestResetPassword,
    ResetPassword,
    changePassword,
  },
};
