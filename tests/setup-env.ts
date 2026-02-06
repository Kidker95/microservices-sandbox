process.env.NODE_ENV = "test";
process.env.PORT = "4000";

process.env.MONGO_CONNECTION_STRING = "mongodb://does-not-exist.local/test";
process.env.SEED_ROOT_ADMIN_EMAIL = "root@example.com";
process.env.HASHING_SALT = "salt";
process.env.PASSWORD_PEPPER = "pepper";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.BCRYPT_SALT_ROUNDS = "10";

process.env.USER_SERVICE_BASE_URL = "http://localhost:4001";
process.env.ORDER_SERVICE_BASE_URL = "http://localhost:4002";
process.env.PRODUCT_SERVICE_BASE_URL = "http://localhost:4003";
process.env.RECEIPT_SERVICE_BASE_URL = "http://localhost:4004";
process.env.FORTUNE_SERVICE_BASE_URL = "http://localhost:4006";
process.env.AUTH_SERVICE_BASE_URL = "http://localhost:4007";
process.env.NGINX_HEALTH_URL = "http://localhost:8080/health";

process.env.FORTUNE_UPSTREAM_BASE_URL = "http://fortune-upstream.local";
