#!/bin/sh

echo 'git stash'
stash=$(git stash)
echo $stash

pop=true
if [[ "$stash" =~ "No local changes to save" ]]; then
  pop=false
fi

echo ''
echo 'git checkout heroku'
git checkout heroku

echo ''
echo 'yarn build'
yarn build

echo ''
echo 'git add .'
git add .

echo ''
echo 'git commit -m "prepare for deploy"'
git commit -m "prepare for deploy"


echo ''
echo 'git subtree push --prefix dist heroku master'
git subtree push --prefix dist heroku master

echo ''
echo 'git checkout master'
git checkout master

if $pop ; then
  echo ''
  echo 'git stash pop'
  git stash pop
fi
