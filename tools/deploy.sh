#!/bin/bash
echo "Deploy script 1.0"

for i in "$@"
do
case $i in
    -r=*|--repo=*)
    REPO="${i#*=}"
    ;;
    -b=*|--branch=*)
    BRANCH="${i#*=}"
    ;;
    -m=*|--message=*)
    COMMIT_MESSAGE="${i#*=}"
    ;;
esac
done
echo REPO = ${REPO}
echo BRANCH = ${BRANCH}
echo COMMIT_MESSAGE = ${COMMIT_MESSAGE}

if [ -d "./to-deploy" ]; then
    echo "Should remove temp directory first"
    rm "./to-deploy" -rf
fi

cp -r "./dist" "./to-deploy"
cd "to-deploy"
git init
git checkout -b "$BRANCH"
git add .
git commit -m "$COMMIT_MESSAGE" --author="Deployment Bot<deploy_bot@example.org>"
git remote add origin "$REPO"
git push -u origin HEAD --force