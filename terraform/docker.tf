terraform {
  required_providers {
    docker = {
      source = "kreuzwerker/docker"
    }
  }
  required_version = ">= 1.7.5"
}

provider docker {
}

resource "random_string" "app_secret" {
  length           = 16
  special          = false
  override_special = "/@\" "
}

resource docker_image "regapi_image" {
  name = "regapi"
}

resource docker_container "regapi_container" {
  name = "regapi"
  image = docker_image.regapi_image.image_id
  ports {
    internal = 8080
    external = 8080
  }
  networks_advanced {
    name = docker_network.private_network.name
  }
  env = [ 
    "FLASK_ENV=development",
    "FLASK_APP=wsgi.py",
    "SECRET_KEY=${md5(random_string.app_secret.result)}",
    "APP_SETTINGS=dev",

    "DATABASE_USERNAME=padmin",
    "DATABASE_PASSWORD=${random_string.postgresAppPassword.result}",
    "DATABASE_NAME=business-ar",
    "DATABASE_HOST=reg_postgres",
    "DATABASE_PORT=5432",

    "DATABASE_TEST_USERNAME=padmin",
    "DATABASE_TEST_PASSWORD=${random_string.postgresAppPassword.result}",
    "DATABASE_TEST_NAME=business-ar-test",
    "DATABASE_TEST_HOST=reg_postgres",
    "DATABASE_TEST_PORT=5432",

    "AUTH_API_URL=${var.auth_api_url}",
    "PAY_API_URL=${var.pay_api_url}",

    "JWT_OIDC_ALGORITHMS=RS256",
    "JWT_OIDC_AUDIENCE=account-services",
    "JWT_OIDC_CACHING_ENABLED=True",
    "JWT_OIDC_CLIENT_SECRET=${random_string.app_secret.result}",
    "JWT_OIDC_ISSUER=${var.oidc_issuer}",
    "JWT_OIDC_JWKS_CACHE_TIMEOUT=6000",
    "JWT_OIDC_WELL_KNOWN_CONFIG=${var.oidc_well_known_config}",

    "AUTH_SVC_URL=${var.auth_svc_url}",
    "AUTH_SVC_CLIENT_ID=${var.auth_client_id}",
    "AUTH_SVC_CLIENT_SECRET=${var.auth_client_secret}",

  ]
}

# data "template_file" "firebase_adminsdk_json" {
#   template = file("${path.module}/project-firebase-adminsdk.json")
#   vars = {
#   }
# }

# resource "local_file" "postgres_script" {
#   content  = data.template_file.firebase_adminsdk_json.rendered
#   filename = "${var.hostRootPath}/data/web/project-firebase-adminsdk.json"
# }

resource docker_image "regweb_image" {
  name = "regweb"
}

resource docker_container "regweb_container" {
  name = "regweb"
  image = docker_image.regweb_image.image_id
  ports {
    internal = 3000
    external = 3000
  }
  ports {
    internal = 4000
    external = 4000
  }

  volumes {
    host_path      = "${var.hostRootPath}/data/web"
    container_path = "/app/config"
  }

  networks_advanced {
    name = docker_network.private_network.name
  }
  env = [ 
    "VUE_APP_ADDRESS_COMPLETE_KEY=${var.canada_post_api_key}",
    "VUE_APP_PAY_API_URL=${var.pay_api_url}",
    "VUE_APP_PAY_API_VERSION=${var.pay_api_version}",
    "NUXT_KEYCLOAK_AUTH_URL=${var.auth_url}",
    "NUXT_KEYCLOAK_REALM=${var.auth_realm}",
    "NUXT_KEYCLOAK_CLIENTID=${var.nuxt_client_id}",

    "NUXT_REGISTRY_HOME_URL=${var.registry_home_url}",
  ]
}


