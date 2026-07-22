<?php

use Illuminate\Database\Eloquent\Model;

class Rol extends Model {
    protected $table = 'roles';
    public $timestamps = false;
    
    public function usuarios() {
        return $this->hasMany(Usuario::class, 'rol_id');
    }
}
