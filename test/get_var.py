#!/usr/bin/env python3

import argparse
import subprocess
import os

parser = argparse.ArgumentParser(
                    prog='get_var',
                    description='gets a variable from op or environment')

parser.add_argument('op_loc', required=True)
parser.add_argument('var_name', required=True)
parser.add_argument('var_append', required=False)

args = parser.parse_args()

envCp = os.environ.copy()

result = ""
try:
  result = subprocess.Popen(["op", "read", args.op_loc], stdout = subprocess.PIPE, env=envCp)
except Exception:
  pass


if result:
  print(result.stdout.strip().decode())

if args.var_append:
  print(os.environ[args.var_name] + args.var_append)

print(os.environ[args.var_name])