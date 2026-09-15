<?php

use Illuminate\Database\Eloquent\Model;

class TareaImagen extends Model {
    protected $table = 'tarea_imagenes';
    protected $fillable = [
        'tarea_id',
        'nombre_archivo',
        'nombre_original',
        'ruta',
        'mime_type',
        'peso_bytes'
    ];

    public $timestamps = false; // Solo tiene created_at por defecto en BD

    public function tarea() {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }
}
