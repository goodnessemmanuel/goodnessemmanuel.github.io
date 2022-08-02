# create a jekyll container from ruby alpine image

# At minimum, user ruby 2.5 or later
 FROM ruby:2.7-alpine3.15

 # Add Jekyll dependencies to Alpine
 RUN apk update
 RUN apk add --no-cache build-base gcc cmake git

 # Update the Ruby bundler and install Jekyll
 RUN gem update bundler && gem install bundler jekyll

 COPY Gemfile Gemfile.lock ./
 RUN bundle install  --jobs 20 --retry 5
 WORKDIR /srv/jekyll
 
 CMD ["bundle", "exec", "jekyll", "serve", "--livereload", "--host", "0.0.0.0"]  