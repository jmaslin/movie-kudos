desc "build src and move resources"
task :build do
  sh "tsc"
  sh "mv lambda/custom/src/* lambda/custom"
  sh "rmdir lambda/custom/src"
  sh "cp package.json lambda/custom/package.json"
  sh "cp src/config.json lambda/custom/config.json"
  sh "cd lambda/custom && npm install --production"
  # sh "ask deploy"
end
