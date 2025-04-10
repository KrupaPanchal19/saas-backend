# backend SaaS

new saas base backend

https://3.basecamp.com/4018672/buckets/19468817/todos/4538548082

## sequelize-cmd

-- for create database
npx sequelize-cli db:create

-- for run migration
npx sequelize-cli db:migrate

-- for run all seeder
npx sequelize-cli db:seed:all

-- for particular run seed
npx sequelize-cli db:seed --seed seed-name


module.exports = {
  apps: [
    {
      name: "TFF SAAS staging",
      script: "./server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      restart_delay: 3000,
      ignore_watch: ["node_modules", "public"],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: "production",
        PORT: 4000,
        SECRET_KEY: "gVkYp3s6v9y$B?E(H+MbQeThWmZq4tkd",
        API: "https://tff-v2-api.thefinal-final.com",
        AWS_ACCESS_KEY_ID: "AKIAJJVQ5V4QB4QB44WQ",
        AWS_SECRET_ACCESS_KEY: "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",
        ORIGINATION_NUMBER: "+18445580516",
        EMAIL: "finalfinaldev@gmail.com",
        PASSWORD: "BI2ulex5DEcideUaT1Y+i/4zEZXuLHDTnwQ3hteMGucg",
        GOOGLE_DISTANCE_URL:
          "https://maps.googleapis.com/maps/api/distancematrix/json",
        GOOGLE_KEY: "AIzaSyC2x82EKJjO5n-88Iq55BBSI7QLA1gjtSc",
        WEB_URL: "http://tff-v2.thefinal-final.com",
        STRIPE_PUBLIC_KEY:
          "pk_test_51KY2XpIXvQnMv0I4b9bXwkVJyDdTL68TDRKfCTbsE07Ry1XgVgFX0aZdz5lz41N5QcdhHyyqKatmWlDOpkokkBUs00JUk6kRTJ",
        STRIPE_PRIVATE_KEY:
          "sk_test_51KY2XpIXvQnMv0I4S1RqB58xjsXW9OjgulwVOL0FmstNizIGiAjXHCXLzJRPibA0DG5M8rl8LAlr05vxAtLYW0fl00dtu7neFr",
      },
    },
  ],
};

