module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 8080,
          livereload: true
        }
      }
    },
    // Sass
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'css/style.min.css': 'scss/importer.scss'
        }
      }
    },
    // Watch
    watch: {
      options: {
        livereload: true,
      },
      css: {
        files: '**/*.scss',
        tasks: ['sass']
      }
    }
  });

  // Start web server
  grunt.registerTask('serve', [
    'connect:server',
    'watch'
  ]);

  // Plugin loads
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['sass']);
};