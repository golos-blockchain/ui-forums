# Скачивание

```
git clone https://github.com/golos-blockchain/ui-forums
cd ui-forums
```

# Настройка

После того, как вы скачали проект с GitHub, у вас есть файл `config/default.js` в папке `ui-forums`.

В этом файле необходимо задать:
- `site_domain` - домен вашего форума, пример: https://dev.golostalk.com
- `golos_server_node` - адрес ноды Golos, пример https://api.golos.today

Через этот файл можно внести и многие другие изменения, например, заменить "GolosTalk" названием вашего форума.

# Развертывание

Форум запускается на [http://localhost:3000](http://localhost:3000)

Есть 3 способа развернуть форум.

## Docker Compose (рекомендуется)

Нужно установить [Docker](https://docs.docker.com/engine/install/) и [Docker Compose](https://docs.docker.com/compose/install/).

```
docker-compose up
```

## Docker без Compose

Нужно установить [Docker](https://docs.docker.com/engine/install/).

```
sudo docker build -t local/ui-forums -f Dockerfile .
sudo docker run -d -p 3000:3000 --name ui-forums local/ui-forums
```

## Ручной (для разработчиков)

Нужно установить [Node.js 16](https://github.com/nodesource/distributions/blob/master/README.md).

```
yarn install
yarn run start
```

# Устранение проблем

## Неверная статистика постов\комментов в разделах

Используйте утилиту [fix_stats](fix_stats).
