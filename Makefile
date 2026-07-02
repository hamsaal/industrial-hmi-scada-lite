.PHONY: restore build test check serve api

restore:
	dotnet restore IndustrialHmiScadaLite.sln

build:
	npm run build

test:
	npm test

check:
	npm run ci

serve:
	npm run serve

api:
	dotnet run --project src/ScadaDemo.Api/ScadaDemo.Api.csproj
