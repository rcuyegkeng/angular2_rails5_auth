# Angular 2 and Ruby on Rails User Authentication

- Following this [blog post](https://hackernoon.com/angular-2-and-ruby-on-rails-user-authentication-fde230ddaed8#.m06ujdthk).

- [Blog's Repo containing Rails backend app on Github](https://github.com/avatsaev/rails-devise-token-seed)

## Part 1: Backend

- create a rails project in API mode and Postgres db.
`rails new rails_devise_token_auth --api --database=postgresql`

- Add useful gems to Gemfile.
```
gem 'devise_token_auth'
gem 'omniauth'
gem 'rack-cors', :require => 'rack/cors'
```
    - Devise Token Auth leverages devise.
    - omniauth is a devise_token_auth dependency.
    - rack-cors allows cross domain ajax requests.

- install the gems
`bundle install` 

- Configure cors. Edit config/initializers/cors.rb.
```
Rails.application.config.middleware.use Rack::Cors do
  allow do
    origins '*'
    resource '*',
    :headers => :any,
    :expose  => ['access-token', 'expiry', 'token-type', 'uid', 'client'],
    :methods => [:get, :post, :options, :delete, :put]
  end
end
```

- Check the setup of the postgres database in config/database.yml
    + I made no changes
- Create the initial (blank) database:
`rails db:create`
    - n.b. I had to create the database before generating User model in the next step. An error was thrown if the database did not exist.

- Initialize the user model with DeviseTokenAuth
`rails generate devise_token_auth:install User auth`
    - User will be our model name
    - auth will be the endpoint of our user management rest api
        + e.g. /auth/sign_in, /auth/sign_out

- Configure User Model.
- Disable account email validation for this application
    + TODO: How does email validation work? How can it be customized? We'll need this function in a real application.
- remove `:confirmable` from the devise configuration in the User model.

- Create a default user in db/seeds.rb.
`User.create(email: 'user@example.com', nickname: 'UOne', name: 'User One', password: "monkey67")`
    - Our login will be user@example.com with the password monkey67

- migrate and seed the database
`rails db:migrate && rails db:seed`

- Author uses Paw to test API.
    + Paw is for Mac. We'll need an alternative that runs on Linux.
    + Can use curl.
    + Can use Postman.
        * Postman seems to work well.

- n.b. In the response the access-token is in the Headers.
    + The body contains the user record.

 

