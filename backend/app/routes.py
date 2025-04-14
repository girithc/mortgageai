from flask import Blueprint, render_template

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html', title='Home', heading='Hello Flask!', message='This is dynamic content.')

@main.route('/about')
def about():
    return render_template('about.html', title='About', heading='About Flask', message='This is the about page.')

@main.route('/contact')
def contact():
    return render_template('contact.html', title='Contact', heading='Contact Us', message='This is the contact page.')
