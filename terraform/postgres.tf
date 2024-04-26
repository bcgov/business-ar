resource "random_string" "postgresSuperPassword" {
  length           = 16
  special          = false
  override_special = "/@\" "
}

resource "random_string" "postgresAppPassword" {
  length           = 16
  special          = false
  override_special = "/@\" "
}


data docker_registry_image "postgres" {
  name = "postgres:16.2-alpine3.19"
}

resource "docker_image" "postgres" {
  name          = data.docker_registry_image.postgres.name
  pull_triggers = [data.docker_registry_image.postgres.sha256_digest]
  keep_locally  = true
}

resource docker_container "postgres_container" {
  name = "reg_postgres"
  image = docker_image.postgres.image_id
  restart = "on-failure"
  volumes {
    host_path      = "${var.hostRootPath}/data/postgres"
    container_path = "/var/lib/postgresql/data"
  }
  env = [
    "POSTGRES_USER=padmin",
    "POSTGRES_PASSWORD=${random_string.postgresSuperPassword.result}",
  ]
  networks_advanced {
    name = docker_network.private_network.name
  }

  healthcheck {
    test         = ["CMD-SHELL", "pg_isready -U padmin"]
    interval     = "5s"
    timeout      = "5s"
    start_period = "5s"
    retries      = 20
  }
}