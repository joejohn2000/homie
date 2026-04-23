"""
WSGI config for Homie Core project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'homie_core.settings')

application = get_wsgi_application()
